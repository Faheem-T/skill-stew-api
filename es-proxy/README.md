# ES Proxy Service

The ES Proxy service acts as a read replica layer between clients and Elasticsearch. It consumes events from RabbitMQ to keep Elasticsearch indices in sync with the source-of-truth databases, and exposes search and recommendation endpoints to clients.

**Runtime:** Node.js (tsx)  
**Database:** Elasticsearch (read replica, no primary data)  
**Infisical Path:** `/es-proxy-service`

## API Endpoints

All routes are prefixed with `/api/v1/search` and routed through the API Gateway.

### Users (`/search/users`)

| Method | Path           | Description                                   |
| ------ | -------------- | --------------------------------------------- |
| GET    | `/recommended` | Get recommended users based on skill matching |

### Skills (`/search/skills`)

| Method | Path | Description                         |
| ------ | ---- | ----------------------------------- |
| GET    | `/`  | Search skills (autocomplete/search) |

## Event Consumers

The service subscribes to events from other services and updates its Elasticsearch indices accordingly:

### User Events

| Event                  | Action                                           |
| ---------------------- | ------------------------------------------------ |
| `user.registered`      | Creates a user document in the ES index          |
| `user.verified`        | Marks the user as verified                       |
| `user.profileUpdated`  | Updates user profile fields (name, avatar, etc.) |
| `skill.profileUpdated` | Updates the user's offered/wanted skills         |

### Skill Events

| Event                | Action                           |
| -------------------- | -------------------------------- |
| `skill.created`      | Indexes a new skill for search   |
| `skill.updated`      | Updates the skill document       |
| `skill.deleted`      | Removes the skill from the index |
| `workshop.published` | Indexes a published workshop     |

## How It Works

```
Source Services → RabbitMQ → ES Proxy → Elasticsearch
                                ↑
                           Client reads
```

1. **Write path:** The user service and skill service write to their own databases and publish events via outbox workers
2. **Sync path:** The ES Proxy consumes these events and updates Elasticsearch indices (eventual consistency)
3. **Read path:** Clients query the ES Proxy for search and recommendations — the proxy reads from Elasticsearch and returns results

This decouples search functionality from the primary services and allows Elasticsearch-specific optimizations (full-text search, skill matching queries) without affecting the source databases.

## Environment Variables

| Variable                      | Description                                           |
| ----------------------------- | ----------------------------------------------------- |
| `PORT`                        | Service port                                          |
| `ES_URL`                      | Elasticsearch connection URL                          |
| `S3_BUCKET_NAME`              | S3 bucket (for constructing avatar URLs)              |
| `CDN_DOMAIN_NAME`             | CDN domain (for serving avatar URLs)                  |
| `RABBIT_MQ_CONNECTION_STRING` | RabbitMQ connection URL                               |
| `USER_SERVICE_URL`            | User service URL (for fetching user data during sync) |

## Key Design Decisions

- **Service class pattern** with manual DI — same approach as the skill service.
- **Eventual consistency** — Elasticsearch is always slightly behind the source databases. Acceptable because search results don't need to be real-time.
- **CDN URL construction in the proxy** — avatar URLs are assembled here (S3 bucket + CDN domain) rather than stored in Elasticsearch, keeping the indexed data minimal.
- **Retryable error handling** — some consumer handlers (e.g., `user.verified`) return `{ success: false, retryable: true }` so the message broker can redeliver failed messages.

## Directory Structure

```
es-proxy/src/
├── domain/
│   ├── entities/               # User, Skill domain types
│   ├── errors/                 # DomainError subclasses
│   └── repositories/           # Repository interfaces
├── application/
│   ├── services/               # UserService, SkillService
│   ├── interfaces/             # Service interfaces
│   └── dtos/                   # Data transfer objects
├── infrastructure/
│   ├── repositories/           # Elasticsearch repository implementations
│   ├── adapters/               # MessageConsumer (RabbitMQ)
│   ├── mappers/                # Error mappers
│   └── config/                 # Elasticsearch connection setup
├── presentation/
│   ├── routers/                # Express route definitions
│   ├── controllers/            # Request handlers
│   ├── middlewares/            # Error handling, HTTP logging
│   └── errors/                 # Error code to status code mapping
├── consumers/                  # Event consumer setup and handler registration
├── di/                         # Manual dependency injection
└── utils/                      # Logger, env var validation
```
