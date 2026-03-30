# Skill Outbox Worker

A lightweight polling worker that reads pending events from the skill service's Mongo-backed outbox collection and publishes them to RabbitMQ. This is the publishing half of the transactional outbox pattern for the skill service.

**Runtime:** Bun  
**Database:** MongoDB (same database as skill service)  
**Infisical Path:** `/skill-service-outbox-worker`

## Published Events

| Event Name            | Trigger                                |
| --------------------- | -------------------------------------- |
| `workshop.published`  | Workshop publish succeeds in `skill`   |

## Environment Variables

| Variable                      | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `DATABASE_URL`                | MongoDB connection string (same as skill service) |
| `RABBIT_MQ_CONNECTION_STRING` | RabbitMQ connection URL                         |
| `POLL_INTERVAL_MS`            | Polling interval in milliseconds                |
