# Transactional Outbox Pattern

## The Problem

In a microservices system, a use case often needs to both **persist data** and **publish an event** so that downstream services can react. The failure scenario:

1. Write to the database ✅
2. App crashes before publishing to RabbitMQ ❌
3. Downstream side effects (notifications, search index updates) never occur

Publishing directly from the use case is unreliable because the database write and the message broker publish are two separate operations — there's no shared transaction between them. This is the **dual-write problem**.

## How It Works

### 1. Write Data + Event in the Same Transaction

Instead of publishing directly, the use case writes the business data **and** an outbox event to the same database in a single transaction (using the [Unit of Work pattern](./unit-of-work-pattern.md)):

```ts
return this._unitOfWork.transact(async (tx) => {
  const saved = await this._connectionRepo.upsert(newConnection, tx);

  await this._outboxRepo.create(
    { id: uuidv7(), name: "connection.requested", payload, status: "PENDING" },
    tx, // Same transaction
  );

  return saved.status;
});
```

The outbox table ([schema](../outbox-workers/user-outbox-worker/src/db/schemas/outboxEventSchema.ts)) stores the event name, payload, status (`PENDING` / `PROCESSED`), and timestamps. If either write fails, the transaction rolls back and neither is persisted.

### 2. Outbox Worker Polls and Publishes

A standalone outbox worker ([source](../outbox-workers/user-outbox-worker/src/index.ts)) — deployed as a **separate Kubernetes Deployment** — runs on a configurable interval (default: 5 seconds via `POLL_INTERVAL_MS`):

```ts
intervalId = setInterval(async () => {
  // 1. Fetch up to 20 PENDING events
  const rows = await db
    .select()
    .from(outboxEventsTable)
    .where(eq(outboxEventsTable.status, "PENDING"))
    .limit(PENDING_FETCH_LIMIT);

  for (const row of rows) {
    // 2. Validate event name and payload against shared schemas
    // 3. Publish to RabbitMQ topic exchange (persistent messages)
    channel.publish(EXCHANGE_NAME, routingKey, message, { persistent: true });
    // 4. Mark as PROCESSED only after successful publish
    await db
      .update(outboxEventsTable)
      .set({ status: "PROCESSED", processed_at: new Date() })
      .where(eq(outboxEventsTable.id, id));
  }
}, intervalMs);
```

Key details:

- **Validation before publishing** — The worker validates both the event name and payload against shared Zod schemas from `@skillstew/common` before publishing. Invalid events are logged and marked as `PROCESSED` to prevent infinite retries.
- **Persistent messages** — Events are published with `{ persistent: true }` so RabbitMQ writes them to disk.
- **Graceful shutdown** — The worker handles `SIGTERM`/`SIGINT`, closing the RabbitMQ channel and database connection cleanly.

### 3. Consumers Must Be Idempotent

There is still a failure scenario: the worker publishes a message and crashes **before** marking it as `PROCESSED`. When it restarts, it will re-fetch and re-publish the same event. This means the system provides **at-least-once delivery** — exactly-once delivery is extremely hard to achieve, and most production systems opt for at-least-once with idempotent consumers instead.

This is why all event consumers in the system are designed to handle duplicate events safely.

## Current State

- Only the **user service** has an outbox worker (`user-outbox-worker`) right now. Other services will get their own workers as they begin publishing events via the outbox.
- Currently, a single worker instance runs per service. Scaling to multiple worker instances would introduce a race condition where two workers could process the same event simultaneously. This is a known problem with well-established solutions (e.g., `SELECT ... FOR UPDATE SKIP LOCKED`), but I have deliberately not addressed it at this stage to keep the system simpler.

## What I Learned

- **Transactions add load.** Every use case that publishes an event now involves a transaction wrapping two writes instead of one. This is a real cost, but an acceptable trade-off for delivery guarantees.
- **The worker is simple by design.** It's a single file with a `setInterval` loop — no framework, no abstraction layers. For a polling worker, this is all you need.
- **At-least-once delivery is a conscious trade-off, not a bug.** Understanding that exactly-once is impractical in distributed systems, and designing consumers to be idempotent, is more important than trying to achieve a guarantee that's nearly impossible to maintain.
