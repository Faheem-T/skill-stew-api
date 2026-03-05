# Connection Logic

## The Problem

Users need to connect with each other — request, accept, reject. The challenge is modeling this cleanly in a single database table while making queries efficient and avoiding duplicate rows for the same pair of users.

## Initial Approach (Discarded)

The first design used `requesterId` and `recipientId` as the primary columns:

```ts
// Schema
userConnectionsTable = pgTable(
  "user_connections",
  {
    id: uuid().primaryKey(),
    requester_id: uuid(),
    recipient_id: uuid(),
    status: connectionStatusEnum("status"), // PENDING | ACCEPTED | REJECTED
  },
  (t) => [unique().on(t.recipient_id, t.requester_id)],
);
```

**The flow:**

1. User A requests to connect with User B → row created: `{requester: A, recipient: B, status: PENDING}`
2. User B accepts → original row updated to `ACCEPTED`, **plus a mirror row** inserted: `{requester: B, recipient: A, status: ACCEPTED}` — to make it easier to query "all connections for user X"
3. User B rejects → row updated to `REJECTED`

**Problems with this approach:**

- **Two queries needed** to check connection status between two users (check A→B, then B→A)
- **Mirror rows** on acceptance made the data model messy
- **Complex DTO** needed to disambiguate the status from one user's perspective:

```ts
type GetConnectionStatusToUserOutputDTO = {
  connectionId: string;
  status:
    | UserConnectionStatus
    | "CURRENT_USER_REQUESTING"
    | "REJECTED_BY_TARGET_USER"
    | "NONE";
};
```

## Current Approach

### 1. Lexicographic Ordering

The key insight: store `userId1` and `userId2` in **lexicographic order** (`userId1 < userId2`), regardless of who sent the request. This guarantees that users A and B always map to the same row — no mirror rows, no ambiguity.

```ts
export class UserConnection {
  userId1: string;
  userId2: string;
  constructor(id, userId1, userId2, public requesterId, public status, ...) {
    // Domain rule: always store in sorted order
    if (userId1.localeCompare(userId2) < 0) {
      this.userId1 = userId1;
      this.userId2 = userId2;
    } else {
      this.userId1 = userId2;
      this.userId2 = userId1;
    }
  }
}
```

The `requesterId` field separately tracks who initiated the request. A single query on `(userId1, userId2)` now always finds the connection.

### 2. No More "REJECTED" Status

When a connection is rejected, the row is **deleted** instead of being marked as `REJECTED`. This trades historical data for simplicity — the status enum is now just `PENDING | ACCEPTED`, and the DTO is cleaner:

```ts
type Status = "PENDING_SENT" | "PENDING_RECEIVED" | "CONNECTED" | "NONE";
```

### 3. Mutual Request = Auto-Accept via Upsert

A deliberate UX design choice: if User A has a pending request to User B, and User B sends a request to User A, the connection is **automatically accepted**. This is implemented with a single database [`upsert`](../user/src/infrastructure/repositories/UserConnectionRepository.ts):

```ts
upsert = async (connection: UserConnection, tx?: TransactionContext) => {
  const rows = await runner
    .insert(this.table)
    .values(data)
    .onConflictDoUpdate({
      target: [this.table.user_id_1, this.table.user_id_2],
      set: { status: "ACCEPTED" },
      // Only accept if the new requester is NOT the original requester
      setWhere: sql`${this.table.requester_id} != ${connection.requesterId}`,
    })
    .returning();
  return this.mapper.toDomain(rows[0]);
};
```

The `setWhere` clause is critical — it prevents a user from accepting their own request by sending a duplicate. Only the **other party** can trigger auto-acceptance.

This means there are **two paths to acceptance**:

1. **Explicit** — recipient clicks "Accept" → [`AcceptConnection`](../user/src/application/use-cases/user/AcceptConnection.usecase.ts) use case
2. **Implicit** — recipient sends their own request → `SendConnectionRequest` detects the mutual request and auto-accepts via upsert

Both are intentional and coexist.

## Edge Cases Handled

- **Self-connections** — blocked at the use case level with a [`SelfConnectionError`](../user/src/domain/errors/SelfConnectionError.ts)
- **Rejecting an accepted connection** — blocked with [`RejectingAcceptedConnectionError`](../user/src/domain/errors/RejectingAcceptedError.ts) (disconnect is not currently a feature)
- **Duplicate requests** — the upsert naturally handles this: if the same user sends a request again, the `setWhere` clause prevents any change (requester == original requester)
- **Authorization** — both accept and reject verify that the requesting user is actually the recipient, not the original requester

## What I Learned

- **The lexicographic ordering trick was the biggest learning.** Storing the user pair in a canonical order eliminates an entire class of query ambiguity. One unique constraint on `(userId1, userId2)` replaces what previously required two lookups and mirror rows.
- **Upsert with conditional update is powerful.** Drizzle's `onConflictDoUpdate` with `setWhere` lets you express complex state transitions in a single atomic query — no race conditions, no read-then-write.
- **Simpler status enums lead to simpler code.** Dropping `REJECTED` from the status and deleting rows instead removed an entire category of edge cases from query logic and the frontend.
