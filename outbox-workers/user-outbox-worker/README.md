# User Outbox Worker

A lightweight polling worker that reads pending events from the user service's outbox table and publishes them to RabbitMQ. This is the publishing half of the [transactional outbox pattern](../../docs/transactional-outbox.md).

**Runtime:** Bun  
**Database:** PostgreSQL (same database as user service)  
**Infisical Path:** `/user-service-outbox-worker`

## How It Works

1. **Poll** — every `POLL_INTERVAL_MS` (default: 5 seconds), fetch up to 20 `PENDING` events from the `outbox_events` table
2. **Validate** — check event name and payload against shared Zod schemas from `@skillstew/common`
3. **Publish** — send the event to RabbitMQ's `stew_exchange` (topic exchange) with `{ persistent: true }`
4. **Mark processed** — update the event status to `PROCESSED` with a timestamp

Invalid events (unknown name or bad payload) are logged and marked as `PROCESSED` to prevent infinite retries. If publishing fails, the event is **not** marked processed and will be retried on the next poll.

## Published Events

All events defined in the user service's outbox:

| Event Name             | Trigger                                             |
| ---------------------- | --------------------------------------------------- |
| `connection.requested` | User sends a connection request                     |
| `connection.accepted`  | Connection is accepted (explicit or mutual request) |
| `connection.rejected`  | Connection request is rejected                      |

## Environment Variables

| Variable                      | Description                                         |
| ----------------------------- | --------------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL connection string (same as user service) |
| `RABBIT_MQ_CONNECTION_STRING` | RabbitMQ connection URL                             |
| `POLL_INTERVAL_MS`            | Polling interval in milliseconds (default: 5000)    |

## Graceful Shutdown

Handles `SIGTERM` and `SIGINT` — clears the polling interval, closes the RabbitMQ channel and connection, and ends the database pool before exiting.

## Directory Structure

```
user-outbox-worker/
├── src/
│   ├── index.ts              # Main polling loop, validation, publishing
│   ├── db/
│   │   └── schemas/          # Drizzle outbox_events table schema
│   ├── enums/                # Outbox event status enum
│   └── utils/                # Logger, env var validation
└── scripts/
    └── docker-entrypoint.sh  # Infisical auth + bun start
```
