# User Service

The user service handles authentication, user profiles, onboarding, and user connections. It is the most feature-complete service in the system and the first one built.

**Runtime:** Node.js (tsx)  
**Database:** PostgreSQL (Drizzle ORM)  
**Infisical Path:** `/user-service`

## API Endpoints

All routes are prefixed with `/api/v1` and routed through the API Gateway.

### Auth (`/auth`)

| Method | Path                        | Description                       | Auth Required |
| ------ | --------------------------- | --------------------------------- | ------------- |
| POST   | `/register`                 | Register a new user               | No            |
| POST   | `/verify`                   | Verify email with token           | No            |
| POST   | `/resend-verification-link` | Resend email verification link    | No            |
| POST   | `/login`                    | Login with email and password     | No            |
| POST   | `/refresh`                  | Refresh access token              | No            |
| POST   | `/google-auth`              | Google OAuth login/registration   | No            |
| POST   | `/logout`                   | Logout (invalidate refresh token) | No            |

### Current User (`/me`)

| Method | Path                 | Description                       | Roles               |
| ------ | -------------------- | --------------------------------- | ------------------- |
| GET    | `/`                  | Get current user's profile        | USER, EXPERT, ADMIN |
| PATCH  | `/`                  | Update current user's profile     | USER                |
| POST   | `/upload/pre-signed` | Generate S3 pre-signed upload URL | Any authenticated   |
| PATCH  | `/username`          | Update username                   | Any authenticated   |

### Users (`/users`)

| Method | Path                     | Description                      | Roles |
| ------ | ------------------------ | -------------------------------- | ----- |
| GET    | `/`                      | Get all users (paginated)        | ADMIN |
| PATCH  | `/:id/block-status`      | Block/unblock a user             | ADMIN |
| PATCH  | `/onboarding/profile`    | Complete onboarding profile      | USER  |
| GET    | `/username-availability` | Check if a username is available | Any   |
| GET    | `/:id/avatar`            | Get a user's avatar URL          | Any   |
| GET    | `/:id`                   | Get a user's public profile      | Any   |

### Connections (`/connections`)

| Method | Path                     | Description                       | Auth Required |
| ------ | ------------------------ | --------------------------------- | ------------- |
| POST   | `/:userId`               | Send connection request to user   | Yes           |
| PATCH  | `/:connectionId/accept`  | Accept a connection request       | Yes           |
| PATCH  | `/:connectionId/reject`  | Reject a connection request       | Yes           |
| GET    | `/status/:targetId`      | Get connection status with a user | Yes           |
| GET    | `/:userId/connected-ids` | Get all connected user IDs        | Yes           |

## Database Schema

PostgreSQL with 5 tables managed via Drizzle ORM.

| Table              | Description                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `users`            | Core user data: email, role, verification/block status, password hash                          |
| `user_profiles`    | Extended profile: name, avatar, location, languages, social links, onboarding status           |
| `admin_profiles`   | Admin-specific profile data: name, avatar                                                      |
| `user_connections` | Connection pairs with lexicographic ordering (`userId1 < userId2`), status, requester tracking |
| `outbox_events`    | Transactional outbox for reliable event publishing (polled by `user-outbox-worker`)            |

### Key Schema Details

- **`user_connections`** uses a unique constraint on `(userId1, userId2)` with lexicographic ordering to guarantee one row per user pair. See [Connection Logic](../docs/connection-logic.md) for details.
- **`outbox_events`** stores events as `PENDING` until the [outbox worker](../outbox-workers/user-outbox-worker/) publishes them to RabbitMQ and marks them `PROCESSED`. See [Transactional Outbox](../docs/transactional-outbox.md).

## Environment Variables

The following variables must be set in the Infisical `/user-service` folder:

| Variable                         | Description                                |
| -------------------------------- | ------------------------------------------ |
| `PORT`                           | Service port                               |
| `DATABASE_URL`                   | PostgreSQL connection string               |
| `NODE_ENV`                       | Environment (`development` / `production`) |
| `EMAIL_VERIFICATON_JWT_SECRET`   | JWT secret for email verification tokens   |
| `USER_ACCESS_TOKEN_SECRET`       | JWT signing key for user access tokens     |
| `USER_REFRESH_TOKEN_SECRET`      | JWT signing key for user refresh tokens    |
| `EXPERT_ACCESS_TOKEN_SECRET`     | JWT signing key for expert access tokens   |
| `EXPERT_REFRESH_TOKEN_SECRET`    | JWT signing key for expert refresh tokens  |
| `ADMIN_ACCESS_TOKEN_SECRET`      | JWT signing key for admin access tokens    |
| `ADMIN_REFRESH_TOKEN_SECRET`     | JWT signing key for admin refresh tokens   |
| `NODE_MAILER_HOST`               | SMTP host for sending emails               |
| `NODE_MAILER_PORT`               | SMTP port                                  |
| `NODE_MAILER_GMAIL`              | Gmail address for sending emails           |
| `NODE_MAILER_GMAIL_APP_PASSWORD` | Gmail app password                         |
| `BASE_SERVER_URL`                | Base URL for the backend                   |
| `BASE_FRONTEND_URL`              | Base URL for the frontend                  |
| `GOOGLE_CLIENT_ID`               | Google OAuth client ID                     |
| `S3_BUCKET_NAME`                 | AWS S3 bucket for file uploads             |
| `CDN_DOMAIN_NAME`                | CDN domain for serving uploaded files      |
| `RABBIT_MQ_CONNECTION_STRING`    | RabbitMQ connection URL                    |

## Key Design Decisions

- **Clean Architecture** with use case classes (one class per operation) — the only service that uses this approach instead of service classes. See [Clean Architecture](../docs/clean-architecture.md).
- **Manual dependency injection** via a [`di/`](src/di/) folder — all dependencies are wired up by hand for full control.
- **Unit of Work pattern** for atomic writes — connection + outbox event in the same transaction. See [Unit of Work](../docs/unit-of-work-pattern.md).
- **Bloom filter** for username availability checks — avoids a database query on every keystroke during onboarding.
- **Upsert-based mutual request acceptance** — if both users send a connection request, the second one auto-accepts via `onConflictDoUpdate`. See [Connection Logic](../docs/connection-logic.md).
- **Role-based JWT signing keys** — separate secrets for USER, EXPERT, and ADMIN tokens, identified via `kid` header field.

## Directory Structure

```
user/src/
├── domain/
│   ├── entities/               # UserConnection, UserProfile, User, etc.
│   ├── errors/                 # DomainError subclasses (NotFoundError, SelfConnectionError, etc.)
│   └── repositories/           # Repository interfaces (IUserRepository, IUserConnectionRepository, etc.)
├── application/
│   ├── use-cases/              # One class per operation (RegisterUser, SendConnectionRequest, etc.)
│   │   ├── auth/
│   │   ├── user/
│   │   └── common/
│   ├── interfaces/             # Use case interfaces
│   ├── ports/                  # Adapter interfaces (IUnitOfWork, IBloomFilter, IConsumer)
│   ├── errors/                 # AppError, InfraError, TransientInfraError subclasses
│   └── dtos/                   # Data transfer objects
├── infrastructure/
│   ├── db/schemas/             # Drizzle table schemas
│   ├── repositories/           # Repository implementations
│   ├── adapters/               # Port implementations (WinstonLogger, etc.)
│   ├── mappers/                # DB row ↔ domain entity mappers
│   └── services/               # External service integrations (email, event consumer)
├── presentation/
│   ├── routers/                # Express route definitions
│   ├── controllers/            # Request handlers
│   ├── middlewares/            # Auth, error handling, role checking
│   └── errors/                 # ErrorCodeToStatusCodeMap
├── di/                         # Manual dependency injection wiring
├── utils/                      # Logger, config, env var validation
└── types/                      # TypeScript type definitions
```
