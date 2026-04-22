# Payment Outbox Worker

Polls the `payments.outbox_events` table, validates pending events against `@skillstew/common`, publishes them to RabbitMQ, and marks them processed.

## Local Development

```bash
bun install
bun start
```
