# Unit of Work Pattern

## The Problem

When a use case needs to write to multiple tables or collections atomically — for example, saving a connection request **and** creating an outbox event — each write must happen within the same database transaction. If the app crashes between two independent writes, the data ends up in an inconsistent state: the connection exists but the event was never published.

The challenge is making this work within clean architecture, where use cases depend on repository interfaces and shouldn't know about the underlying database or transaction mechanism.

## How It Works

The pattern has three parts:

### 1. The Interface (Application Layer)

Both the [user service](../user/src/application/ports/IUnitOfWork.ts) (PostgreSQL) and [notification service](../notification-service/src/application/ports/IUnitOfWork.ts) (MongoDB) define the exact same port:

```ts
// application/ports/IUnitOfWork.ts
export interface IUnitOfWork {
  transact<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}
```

`TransactionContext` is a type alias that differs per service but is opaque to the application layer — use cases just pass it through.

### 2. The Implementation (Infrastructure Layer)

Each service provides its own implementation that wraps the ORM's native transaction API:

**Drizzle** ([user service implementation](../user/src/infrastructure/persistence/UnitOfWork.ts)) — [`TransactionContext = NodePgDatabase`](../user/src/types/TransactionContext.ts)

```ts
export class UnitOfWork implements IUnitOfWork {
  async transact<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return db.transaction(async (tx) => {
      return work(tx);
    });
  }
}
```

**Mongoose** ([notification service implementation](../notification-service/src/infrastructure/adapters/UnitOfWork.ts)) — [`TransactionContext = ClientSession`](../notification-service/src/types/TransactionContext.ts)

```ts
export class UnitOfWork implements IUnitOfWork {
  async transact<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return mongoose.connection.transaction(async (tx) => {
      return work(tx);
    });
  }
}
```

The implementations are nearly identical — only the underlying transaction mechanism differs.

### 3. Repositories Accept an Optional Transaction

Every repository method accepts an optional `tx` parameter. If a transaction context is passed, the operation runs inside that transaction. If not, it runs standalone. The way `tx` is used differs between ORMs:

**Drizzle (PostgreSQL)** — uses `tx` as an alternative query runner (from [BaseRepository](../user/src/infrastructure/repositories/BaseRepository.ts)):

```ts
create = async (entity: TEntity, tx?: TransactionContext): Promise<TEntity> => {
  const runner = tx ?? db;  // Use transaction if provided, otherwise default connection
  const [row] = await runner.insert(this.table).values(data).returning();
  return this.mapper.toDomain(row);
};
```

**Mongoose (MongoDB)** — passes `tx` as a `session` option (from [NotificationRepository](../notification-service/src/infrastructure/repositories/NotificationRepository.ts)):

```ts
create = async (entity: Notification, tx?: TransactionContext): Promise<Notification> => {
  const notification = this.model.build(attr);
  const saved = await notification.save({ session: tx });  // Pass session to Mongoose
  return this.toDomain(saved);
};
```

Different ORMs, same pattern — repositories stay flexible enough to run both inside and outside transactions without code duplication.

## Usage in a Use Case

Here's a simplified example from [`SendConnectionRequest`](../user/src/application/use-cases/user/SendConnectionRequest.usecase.ts) — it saves a connection and creates an outbox event in the same transaction:

```ts
return this._unitOfWork.transact(async (tx) => {
  const savedConnection = await this._connectionRepo.upsert(newConnection, tx);

  await this._outboxRepo.create(
    {
      id: uuidv7(),
      name: eventName,
      payload,
      status: "PENDING",
      createdAt: new Date(),
    },
    tx,   // Same transaction context
  );

  return savedConnection.status;
});
```

If either the connection upsert or the outbox write fails, the entire transaction rolls back — neither write is persisted.

## Alternative Considered: Aggregate Repositories

Before settling on UnitOfWork, I considered creating **aggregate repositories** — for example, a `ConnectionAggregateRepository` that would internally handle writes to both the `connections` table and the `outbox_events` table. This would have meant creating aggregate entity classes that bundle business data with its associated outbox event, and a dedicated repository that persists both atomically in a single method call.

I discarded this approach because:
- It would require restructuring existing entities and repositories into new aggregate classes — a significant refactor.
- The UnitOfWork approach was less invasive. My existing `ConnectionRepository` and `OutboxEventRepository` stayed completely unchanged — I just added the optional `tx` parameter and let the use case coordinate them.

## What I Learned

- **The interface is deceivingly simple.** The `IUnitOfWork` interface is just one method, but making it work cleanly required threading the optional `tx` parameter through every repository method in the system. It's a cross-cutting concern that touches a lot of code.
- **ORM-agnostic by design.** Because the interface only exposes `transact()` and an opaque `TransactionContext`, switching the underlying database or ORM only requires a new `UnitOfWork` implementation. The same pattern works for both Drizzle (PostgreSQL) and Mongoose (MongoDB) with no changes to the application layer.
- **The `tx ?? db` pattern makes adoption incremental.** Since the transaction context is optional, existing repository methods don't break when you introduce the UnitOfWork — you can adopt it one use case at a time.
- **`TransactionContext` leaks some infrastructure knowledge into the application layer.** The type alias (`NodePgDatabase` or `ClientSession`) is ultimately an ORM-specific type, so the application layer is not fully decoupled from the infrastructure. A wrapper type could be introduced to make the separation stricter, but in practice the leakage is minimal — use cases only pass `tx` through and never call ORM-specific methods on it.
