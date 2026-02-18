# SkillStew API - Agent Development Guidelines

This document provides guidelines for agentic coding agents working in this microservices-based Node.js/TypeScript API repository.

## Architecture Overview

This is a microservices architecture with the following services:

- `user/` - User management, authentication, profiles, connections (PostgreSQL + Drizzle ORM)
- `skill/` - Skill management (MongoDB + Mongoose)
- `payments/` - Subscription plans (PostgreSQL + Drizzle ORM)
- `gateway/` - API Gateway with JWT authentication
- `es-proxy/` - Elasticsearch proxy service
- `websocket-gateway/` - Real-time WebSocket connections via Socket.io (Redis adapter for cross-pod emit)
- `notification/` - Notification service (MongoDB + Mongoose), consumes RabbitMQ events, pushes via `@socket.io/redis-emitter`
- `outbox-workers/` - Outbox polling workers deployed separately per service (currently `user-outbox-worker`)
- `common/` - Shared utilities, types, and event schemas (`@skillstew/common`)

## Build/Development Commands

### Service Development

Each service runs independently with watch mode:

```bash
# User service (with database sync)
cd user && npm start                    # Starts with tsx watch
cd user && npm run syncDb              # Drizzle database schema push
cd user && npm test                    # Run Jest tests

# Skill service (with data seeding)
cd skill && npm start                  # Starts with Bun watch
cd skill && npm run seed               # Seed skill data

# Payments service
cd payments && npm start               # Starts with tsx watch
cd payments && npm run syncDb          # Drizzle database schema push

# Gateway service
cd gateway && npm start                # Starts with tsx watch

# ES Proxy service
cd es-proxy && npm start               # Starts with tsx watch

# WebSocket Gateway service
cd websocket-gateway && bun start      # Starts with Bun watch

# User Outbox Worker
cd outbox-workers/user-outbox-worker && bun start  # Starts with Bun watch
```

### Common Package

```bash
cd common && npm run build             # TypeScript compilation
cd common && npm run pub              # Version bump and publish
```

### Testing

- Only the `user` service has Jest configured currently
- Test command: `cd user && npm test`
- Single test: `cd user && npx jest path/to/test.test.ts`
- Tests are located in `src/__tests__/` directories

### Project-wide

```bash
# Git hooks setup
npm run prepare                        # Installs husky

# Commit linting
npm run commitlint                     # Lints commit messages
```

## Code Style Guidelines

### TypeScript Configuration

- ESNext target with strict mode enabled
- Node.js runtime environment
- ES modules (`"type": "module"` in package.json)
- No explicit `any` types allowed
- Use `bun` for skill service, websocket-gateway, and outbox workers; `tsx` for others

### Import Organization

```typescript
// External libraries first
import express from "express";
import { z } from "zod";
import cors from "cors";

// Internal modules (absolute paths from service root)
import { errorHandler } from "./presentation/middlewares/errorHandler";
import { UserRoles } from "./domain/entities/UserRoles";
import { authController } from "../../di";
```

### File Naming Conventions

- `PascalCase.ts` for classes, entities, interfaces, types
- `camelCase.ts` for utilities, services, mappers
- `kebab-case.ts` for configuration files
- Files ending with `.abstract.ts` for abstract classes
- Files ending with `.enum.ts` for enums
- Test files: `*.test.ts` or `*.spec.ts` in `__tests__/` directories

### Directory Structure (Clean Architecture)

```
src/
├── domain/                 # Business logic
│   ├── entities/          # Business entities
│   ├── repositories/      # Repository interfaces
│   └── errors/           # Domain errors
├── infrastructure/         # External concerns
│   ├── db/               # Database schemas, configs
│   ├── repositories/     # Repository implementations
│   ├── services/         # External services (email, storage, etc.)
│   └── mappers/          # Data transformation
├── application/           # Use cases (es-proxy service)
├── presentation/          # API layer
│   ├── controllers/      # Request handlers
│   ├── routers/          # Express routes
│   ├── middlewares/      # Express middlewares
│   └── errors/           # Error mapping
├── utils/                 # Shared utilities
├── types/                 # TypeScript type definitions
├── constants/             # Application constants
└── di/                   # Dependency injection
```

### Entity & Class Definitions

```typescript
// Domain entity with constructor properties
export class User {
  constructor(
    public id: string,
    public email: string,
    public role: UserRoles,
    public isVerified: boolean,
    public isBlocked: boolean,
    public isGoogleLogin: boolean,
    public username?: string,
    public passwordHash?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
```

### Error Handling

The user service implements a comprehensive three-layer error handling architecture:

#### Error Classification

- **Domain Errors** (`domain/errors/`): Business logic violations (InvalidCredentials, NotFound, BlockedUser, etc.)
- **Application Errors** (`application/errors/`): Infrastructure and technical errors (ValidationError, Database errors, Auth errors)

#### Error Hierarchy

```typescript
// Domain Error Abstract Base Class
export abstract class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCodes,
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    if (cause?.stack && this.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  abstract toJSON(): { errors: { message: string; field?: string }[] };
}

// Application Error Abstract Base Class (includes retryable flag)
export abstract class AppError extends Error {
  constructor(
    public readonly code: AppErrorCodes,
    message: string,
    public readonly cause?: Error,
    public readonly retryable: boolean = false,
  ) {
    super(message);
    if (cause?.stack && this.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  abstract toJSON(): { errors: { message: string; field?: string }[] };
}

// Specific Domain Error Implementation
export class InvalidCredentialsError extends DomainError {
  constructor() {
    super(DomainErrorCodes.INVALID_CREDENTIALS, "Invalid credentials.");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}

// Validation Error (Application Error)
export class ValidationError extends AppError {
  public readonly errors: Array<{ message: string; field?: string }>;

  constructor(
    errors: Array<{ message: string; field?: string }>,
    error?: Error,
  ) {
    super(AppErrorCodes.VALIDATION_ERROR, "Validation Error", error, false);
    this.errors = errors;
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: this.errors };
  }
}
```

#### Centralized Error Management

```typescript
// Error Code Consolidation
export const AllErrorCodes = {
  ...DomainErrorCodes,
  ...AppErrorCodes,
};

// HTTP Status Code Mapping
export const ErrorCodeToStatusCodeMap: Record<AllErrorCodes, number> = {
  [DomainErrorCodes.INVALID_CREDENTIALS]: HttpStatus.BAD_REQUEST,
  [DomainErrorCodes.NOT_FOUND_ERROR]: HttpStatus.NOT_FOUND,
  [DomainErrorCodes.BLOCKED_USER]: HttpStatus.FORBIDDEN,
  [AppErrorCodes.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.DB_CONNECTION_ERROR]: HttpStatus.SERVICE_UNAVAILABLE,
  // ... etc
};
```

#### Global Error Handler

```typescript
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Auto-map Zod validation errors
  if (error instanceof ZodError) {
    error = mapZodErrorToValidationError(error);
  }

  // Extract full error chain for logging
  const errorChain = getFullErrorChain(error);

  // Structured logging with request context
  logger.error({
    message: "Application error occurred",
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      chain: errorChain,
    },
    request: {
      method: req.method,
      url: req.url,
      userId: req.headers["x-user-id"],
    },
  });

  // Map to HTTP response
  if (error instanceof DomainError || error instanceof AppError) {
    const statusCode = ErrorCodeToStatusCodeMap[error.code];
    res.status(statusCode).json({ ...error.toJSON(), success: false });
  } else {
    // Unknown errors get generic response (except in development)
    res.status(500).json({
      success: false,
      errors: [
        {
          message:
            process.env.NODE_ENV === "development"
              ? error.message
              : "An unexpected error occurred",
        },
      ],
    });
  }
};
```

#### Key Principles

- **Error Chaining**: Use `cause` parameter to preserve error context
- **Field-Specific Validation**: Validation errors include field paths for UI feedback
- **Environment-Aware**: Detailed messages in development, safe messages in production
- **Consistent Response Format**: Always `{ success: boolean, errors: Array<{message, field?}> }`
- **Structured Logging**: Include request context and full error chain

### Database Patterns

#### PostgreSQL (Drizzle ORM)

```typescript
// Schema definition
export const userTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
  email: text().unique().notNull(),
  role: roleEnum("role").notNull(),
  is_verified: boolean().default(false).notNull(),
  ...timestamps,
});

// Repository pattern
export class UserRepository implements IUserRepository {
  constructor(private db: DrizzleDB) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(userTable)
      .where(eq(userTable.id, id))
      .limit(1);

    return result[0] ? this.mapper.toDomain(result[0]) : null;
  }
}
```

#### MongoDB (Mongoose)

```typescript
// Model definition
export const SkillModel = new mongoose.model<Skill>("Skill", skillSchema);

// Repository pattern
export class SkillRepository implements ISkillRepository {
  async findById(id: string): Promise<Skill | null> {
    return await SkillModel.findById(id).exec();
  }
}
```

### API Controllers & Routing

```typescript
// Router structure
const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.login);

export default router;

// App setup
app.use("/api/v1/auth", authRouter);
app.use(errorHandler);
```

### Dependency Injection

Use container-based DI pattern:

```typescript
// di/index.ts
export const authController = new AuthController(
  userService,
  jwtService,
  emailService,
);
```

### Logging

Use Winston for structured logging:

```typescript
import { logger } from "./utils/logger";

logger.info("User registered successfully", { userId: user.id });
logger.error("Database connection failed", { error: error.message });
```

#### Logger Format Convention

All services use environment-aware formatting:

```typescript
format: combine(
  timestamp(),
  errors({ stack: true }),
  process.env.NODE_ENV === "production"
    ? json()
    : combine(prettyPrint(), colorize({ all: true })),
),
```

- **Production**: `json()` for structured log aggregation (Loki, ELK, etc.)
- **Non-production**: `prettyPrint()` + `colorize()` for human-readable dev output
- Never combine `json()` with `colorize()` — they produce conflicting output

### Environment Configuration

Use dotenv with typed configuration:

```typescript
// utils/dotenv.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  PORT: parseInt(process.env.PORT || "3000"),
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
} as const;
```

### Validation

Use Zod for schema validation:

```typescript
const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string().min(8),
});
```

## Transactional Outbox Pattern

The user service uses the **transactional outbox pattern** for reliable event publishing. Instead of publishing events directly to RabbitMQ after a DB write (which risks losing events if the app crashes between the two operations), events are written to an `outbox_events` table in the **same database transaction** as the business data.

### How It Works

1. **Use case** writes business data + outbox event in a single transaction via `UnitOfWork`
2. **Outbox worker** (`outbox-workers/user-outbox-worker/`) polls the `outbox_events` table for `PENDING` rows
3. Worker validates the event payload against `EventSchemas` from `@skillstew/common`
4. Worker re-wraps the payload with `CreateEvent()` to produce a full `AppEvent`, publishes to RabbitMQ
5. Worker marks the row as `PROCESSED` with a `processed_at` timestamp

### Outbox Table Schema

```typescript
export const outboxEventsTable = pgTable("outbox_events", {
  id: uuid().primaryKey(),
  event_name: text().notNull(),
  payload: jsonb().notNull(), // Stores the event DATA only, not the full AppEvent
  status: outboxEventStatusEnum().notNull(), // PENDING | PROCESSED
  created_at: timestamp().defaultNow().notNull(),
  processed_at: timestamp(),
});
```

### UnitOfWork Pattern

A thin wrapper around Drizzle's `db.transaction()` for atomic multi-table writes:

```typescript
// Application port (interface)
export interface IUnitOfWork {
  transact<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

// TransactionContext is the Drizzle transaction type (NodePgDatabase)
// All repository methods accept an optional tx parameter:
create(entity: TEntity, tx?: TransactionContext): Promise<TEntity>;
update(id: string, data: Partial<TEntity>, tx?: TransactionContext): Promise<TEntity>;
findById(id: string, tx?: TransactionContext): Promise<TEntity>;
delete(id: string, tx?: TransactionContext): Promise<void>;

// Inside the method: const runner = tx ?? db;
```

### Use Case Example

```typescript
await this.unitOfWork.transact(async (tx) => {
  const saved = await this.connectionRepo.create(newConnection, tx);

  const eventName: EventName = "connection.requested";
  const payload: EventPayload<typeof eventName> = {
    connectionId: saved.id,
    fromUserId: saved.requesterId,
    toUserId: saved.recipientId,
    timestamp: saved.createdAt,
  };

  await this.outboxRepo.create(
    {
      id: uuidv7(),
      name: eventName,
      payload,
      status: "PENDING",
      createdAt: new Date(),
      processedAt: undefined,
    },
    tx,
  );
});
```

### Key Principles

- **Always `await` the `unitOfWork.transact()` call** — missing `await` breaks atomicity and error propagation
- **Store only the event data field** in the outbox payload, not the full `AppEvent` wrapper — the worker re-wraps it
- **Use type-safe event payloads**: `EventPayload<typeof eventName>` ensures compile-time correctness
- **Use cases no longer call the producer directly** — they only write to the outbox; publishing is the worker's job
- **Outbox workers are deployed as separate k8s Deployments** — independent lifecycle and scaling from the API service

## WebSocket Gateway & Real-Time Communication

### Socket.io Authentication

The websocket-gateway authenticates connections via socket.io middleware (not Express middleware):

```typescript
// Socket.io middleware — registered with io.use()
const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));

  const payload = jwtService.verifyAccessToken(token);
  socket.data.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };
  next();
};
```

- Client sends JWT in `socket.handshake.auth.token` during connection
- On failure, `next(new Error(...))` rejects the connection — client receives `connect_error`
- User data attached to `socket.data` (available in all event handlers)

### Room-Based Routing

Every authenticated socket joins a personal room `user:${userId}`:

```typescript
io.on("connection", (socket) => {
  socket.join(`user:${socket.data.user.id}`);
});
```

**Room types (current and planned):**
| Room | Pattern | Purpose |
|---|---|---|
| Personal | `user:<userId>` | Notifications, DM signals |
| Group chat | `group:<groupId>` | Group messages (future) |

- Rooms are lightweight (Set of socket IDs in memory, synced via Redis adapter)
- Users in hundreds of rooms is normal and within socket.io's design
- No need to track socket IDs — rooms abstract that away entirely
- Socket.io automatically removes sockets from rooms on disconnect

### Cross-Pod Communication

- **WebSocket Gateway** uses `@socket.io/redis-adapter` on its `Server` instance
- **Notification Service** uses `@socket.io/redis-emitter` (no socket.io server needed) to emit to rooms:
  ```typescript
  emitter.to(`user:${recipientId}`).emit("notification:new", payload);
  ```
- Both connect to the same Redis — events are broadcast across all ws-gateway pods
- If the target user is offline (no socket in the room), the emit is a no-op; the notification is persisted in MongoDB for REST fetch on next login

## Inter-Service Communication

### RabbitMQ Event System

- **Exchange**: `stew_exchange` (topic exchange, durable)
- **Routing**: Events use `event.eventName` as the routing key (e.g., `connection.requested`)
- **Consumers** bind their queue to specific routing keys they care about
- **Event schemas** are centralized in `@skillstew/common` (`EventSchemas`, `EventName`, `EventPayload<T>`)
- **AppEvent wrapper**: `{ eventId, eventName, timestamp, producer, data, traceId? }`

### Event Flow

1. Use case writes business data + outbox event in one transaction
2. Outbox worker polls, validates, wraps with `CreateEvent()`, publishes to RabbitMQ
3. Consumer services (es-proxy, notification) consume from their queues

### Current Events

| Event                           | Producer      | Consumers              |
| ------------------------------- | ------------- | ---------------------- |
| `user.registered`               | user-service  | es-proxy               |
| `user.verified`                 | user-service  | es-proxy               |
| `user.profileUpdated`           | user-service  | es-proxy               |
| `skill.created/updated/deleted` | skill-service | es-proxy               |
| `skill.profileUpdated`          | skill-service | es-proxy, user-service |
| `connection.requested`          | user-service  | notification           |
| `connection.accepted`           | user-service  | notification           |
| `connection.rejected`           | user-service  | notification           |

## Development Workflow

1. **Always work from service directory** - Each service is independent
2. **Use TypeScript strict mode** - All files must pass type checking
3. **Follow existing patterns** - Mirror existing code structure and conventions
4. **Test in isolation** - Services run independently on different ports
5. **Database migrations** - Use `syncDb` commands for schema changes
6. **Commit messages** - Follow conventional commits (enforced by commitlint)
7. **Common package changes** - After modifying `common/`, run `npm run pub` to bump version and publish, then update the dependency in consuming services

## Technology Stack Summary

- **Runtime**: Node.js with tsx (skill service, websocket-gateway, and outbox workers use Bun)
- **Database**: PostgreSQL (user, payments), MongoDB (skill, notification)
- **ORM**: Drizzle ORM (PostgreSQL), Mongoose (MongoDB)
- **Testing**: Jest (user service only currently)
- **Message Queue**: RabbitMQ (amqplib) with topic exchange (`stew_exchange`)
- **Real-time**: Socket.io with `@socket.io/redis-adapter` (ws-gateway) and `@socket.io/redis-emitter` (notification service)
- **Cache/Adapter**: Redis (socket.io cross-pod communication)
- **Search**: Elasticsearch
- **Storage**: AWS S3
- **Authentication**: JWT with refresh tokens (role-based secrets via `kid` header field)
- **Validation**: Zod schemas
- **Logging**: Winston
- **Secrets Management**: Infisical (via docker-entrypoint scripts)
