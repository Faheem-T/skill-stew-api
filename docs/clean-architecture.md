# Clean Architecture

## Why This Approach

Clean architecture keeps higher-level modules (domain and business logic) independent from lower-level modules (databases, frameworks, HTTP). The dependency rule flows inward — domain knows nothing about infrastructure. This means changing a database, swapping an ORM, or replacing a message broker becomes a matter of creating a new class that implements the same interface and updating the dependency injection.

## How It's Implemented

Each service is split into four layers:

| Layer              | Responsibility                                                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------------------------------- |
| **Domain**         | Core business entities, domain errors, repository interfaces                                                      |
| **Application**    | Use case / service implementations, port interfaces (e.g., `IBloomFilter`, `IConsumer`), DTOs, application errors |
| **Infrastructure** | Repository implementations, port implementations, mappers for DB table/document ↔ domain entity conversion        |
| **Presentation**   | Express controllers, routers, middlewares, error code → HTTP status mapping                                       |

**Dependency rule:** All classes depend on interfaces rather than implementations. The application layer defines port interfaces (abstractions over external concerns like bloom filters or message consumers), and the infrastructure layer provides the concrete implementations.

**Repository mapping:** Repositories always accept **domain entities** and return **domain entities**. The application layer never sees database column names, Drizzle row types, or Mongoose documents. Internally, each repository uses a [mapper](../user/src/infrastructure/mappers/interfaces/Mapper.ts) to convert between the two worlds:

```ts
interface Mapper<TEntity, TPersistence> {
  toDomain(raw: TPersistence): TEntity;
  toPersistence(entity: TEntity): TPersistence;
  toPersistencePartial(partial: Partial<TEntity>): Partial<TPersistence>;
}
```

For example, the [UserMapper](../user/src/infrastructure/mappers/UserMapper.ts) converts between the `User` domain entity (camelCase: `isVerified`, `passwordHash`) and the Drizzle row type (snake_case: `is_verified`, `password_hash`).

The [BaseRepository](../user/src/infrastructure/repositories/BaseRepository.ts) enforces this pattern — it requires every subclass to provide a mapper and uses it in all CRUD operations:

**Dependency injection:** Some services, like the notification service, use [Inversify](https://inversify.io/) for DI. Others have a dedicated `di/` folder where dependencies are wired up manually. I started with manual DI because I wanted full control and to properly understand how dependency injection works at a fundamental level. I later tried Inversify for the notification service. Inversify does take away some of the control you have with manual DI, but I can see it being useful in larger services with many classes and dependencies.

## What I Learned

- Clean architecture does lead to more complexity. The learning curve was a factor, but once you get your head around it, it becomes second nature.
- I experimented with two approaches in the application layer:
  - **Use case classes** (user service): A separate class for each operation — `RegisterUser`, `Login`, etc. This follows the Single Responsibility Principle strictly.
  - **Service classes** (other services): A single `UserService` or `NotificationService` class that groups related operations. This trades SRP for simplicity.
  - I found the service approach to be a fair trade-off, especially for smaller services where one-class-per-operation felt like overkill.
- Error handling across layers was hard to get right, but I landed on an approach I'm happy with. Notes on that [here](./error-handling.md).
