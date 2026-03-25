# Notification Service

The notification service handles notification persistence, real-time delivery, and unread count tracking. It consumes events from RabbitMQ, creates notification records in MongoDB, and pushes them to connected clients in real-time via Socket.io's Redis emitter.

**Runtime:** Bun  
**Database:** MongoDB (Mongoose)  
**Infisical Path:** `/notification-service`

## API Endpoints

All routes are prefixed with `/api/v1/notifications` and routed through the API Gateway.

| Method | Path            | Description                                                  |
| ------ | --------------- | ------------------------------------------------------------ |
| GET    | `/`             | Get notifications for current user (cursor-based pagination) |
| PATCH  | `/:id/read`     | Mark a notification as read                                  |
| GET    | `/unread-count` | Get unread notification count for current user               |

## Event Consumers

The service subscribes to the following RabbitMQ events and creates notifications accordingly:

| Event                  | Notification Created For | Type                  |
| ---------------------- | ------------------------ | --------------------- |
| `connection.requested` | Recipient                | `CONNECTION_REQUEST`  |
| `connection.accepted`  | Original requester       | `CONNECTION_ACCEPTED` |
| `connection.rejected`  | Original requester       | `CONNECTION_REJECTED` |
| `expert.application.submitted` | Admin reviewers | `EXPERT_APPLICATION_SUBMITTED` |
| `expert.application.approved`   | Applicant        | `EXPERT_APPLICATION_APPROVED` |
| `expert.application.rejected`   | Applicant        | `EXPERT_APPLICATION_REJECTED` |

Each handler:

1. Creates a notification record in MongoDB
2. Increments the recipient's unread count (in MongoDB + Redis cache)
3. Emits the notification in real-time via the Socket.io Redis emitter

The service also sends account-related emails for user registration, expert registration, verification link resends, and expert application decisions through its email adapters.

## Data Models

### Notification

Stores individual notifications with `recipientId` (indexed), type, title, message, a flexible `data` field (Mixed type for type-specific payload), and `isRead` flag. Sorted by `_id` descending (MongoDB ObjectID provides second-level ordering — sufficient for notifications).

### UnreadNotificationCount

Tracks per-user unread counts in a dedicated collection. Updated transactionally alongside notification creation/read-marking using the [Unit of Work pattern](../docs/unit-of-work-pattern.md). A Redis cache layer sits in front of this for fast reads.

## Real-time Delivery

The service uses [`@socket.io/redis-emitter`](src/infrastructure/adapters/SocketIoRedisPublisher.ts) to publish notifications to connected clients **without** running a Socket.io server itself. The emitter writes to Redis, and the [WebSocket Gateway](../websocket-gateway/) (which runs the actual Socket.io server with `@socket.io/redis-adapter`) picks up the message and delivers it to the client.

This means the notification service can push real-time events to users without maintaining any WebSocket connections.

## Environment Variables

| Variable                      | Description                                                       |
| ----------------------------- | ----------------------------------------------------------------- |
| `PORT`                        | Service port                                                      |
| `DATABASE_URL`                | MongoDB connection string                                         |
| `RABBIT_MQ_CONNECTION_STRING` | RabbitMQ connection URL                                           |
| `RABBIT_MQ_EXCHANGE_NAME`     | RabbitMQ exchange name (`stew_exchange`)                          |
| `RABBIT_MQ_QUEUE_NAME`        | Queue name for this service's consumer                            |
| `REDIS_URI`                   | Redis connection URL (for Socket.io emitter + unread count cache) |
| `RESEND_API_KEY`              | Resend API key for outbound email delivery                        |
| `EMAIL_VERIFICATION_REDIRECT_URL` | Redirect URL used in verification emails                      |
| `NODE_MAILER_HOST`            | SMTP host for fallback email delivery                             |
| `NODE_MAILER_PORT`            | SMTP port for fallback email delivery                             |
| `NODE_MAILER_GMAIL`           | Gmail address for fallback email delivery                         |
| `NODE_MAILER_GMAIL_APP_PASSWORD` | Gmail app password for fallback email delivery                |
| `BASE_FRONTEND_URL`           | Base frontend URL for email links                                 |

## Key Design Decisions

- **Inversify for DI** — the only service using container-based dependency injection. An experiment in using decorators and IoC containers, as opposed to the manual DI used in other services.
- **Redis-backed unread count cache** — avoids a MongoDB query on every page load for the unread badge. The cache is updated alongside the database within the same flow, keeping them in sync.
- **Socket.io Redis emitter (not a Socket.io server)** — the notification service doesn't manage WebSocket connections. It writes to Redis, and the separate WebSocket Gateway delivers to clients. This keeps the notification service stateless.
- **Transactional writes** — creating a notification and incrementing the unread count happen in the same MongoDB transaction via the Unit of Work pattern.

## Directory Structure

```
notification-service/src/
├── domain/
│   ├── entities/               # Notification, NotificationType, NotificationData
│   ├── errors/                 # DomainError subclasses
│   └── repositories/           # Repository interfaces
├── application/
│   ├── services/               # NotificationService (single service class)
│   ├── service-interfaces/     # Service interface
│   ├── ports/                  # Adapter interfaces (IEventConsumer, IRealtimeEmitter, IUnitOfWork, etc.)
│   └── dtos/                   # Data transfer objects
├── consumers/
│   ├── index.ts                # Event handler registration
│   └── handlers/               # Per-event handler functions
├── infrastructure/
│   ├── models/                 # Mongoose schemas (Notification, UnreadNotificationCount)
│   ├── repositories/           # Repository implementations
│   ├── adapters/               # RabbitMQEventConsumer, SocketIoRedisPublisher, RedisUnreadNotificationCountCache, UnitOfWork, WinstonLogger
│   └── config/                 # MongoDB connection
├── http/
│   ├── routers/                # Express route definitions
│   ├── controllers/            # Request handlers
│   ├── middlewares/            # Error handling
│   └── server.ts               # Express app setup
├── container/                  # Inversify DI container configuration
├── constants/                  # DI type symbols
└── utils/                      # Env var validation
```
