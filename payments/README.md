# Payments Service (WIP)

The payments service handles payment processing and billing for the platform.

> [!NOTE]
> This service is a work in progress. It currently has stub endpoints that simulate checkout session creation and publish payment outcome events to RabbitMQ. No real payment provider is integrated yet.

**Runtime:** Node.js (tsx)  
**Database:** PostgreSQL (Drizzle ORM) - _Tables TBA_  
**Infisical Path:** `/payments-service`

## API Endpoints

All routes are prefixed with `/api/v1/payments` and routed through the API Gateway.

| Method | Path                | Description                                                              |
| ------ | ------------------- | ------------------------------------------------------------------------ |
| POST   | `/checkout-sessions`| Create a dummy payment checkout session                                  |
| POST   | `/outcomes`         | Publish a payment outcome event (`payment.succeeded` / `payment.failed`) |

## Published Events

| Event Name          | Trigger                           |
| ------------------- | --------------------------------- |
| `payment.succeeded` | Outcome endpoint reports success  |
| `payment.failed`    | Outcome endpoint reports failure  |

## Environment Variables

| Variable                      | Description                  |
| ----------------------------- | ---------------------------- |
| `PORT`                        | Service port                 |
| `DATABASE_URL`                | PostgreSQL connection string |
| `RABBIT_MQ_CONNECTION_STRING` | RabbitMQ connection string   |

## Directory Structure

```
payments/src/
├── domain/                  # Entities, domain errors, repository interfaces
├── application/             # Use cases, DTOs, interfaces
├── infrastructure/          # DB repositories, Drizzle schemas, implementations
├── presentation/            # Express controllers, routers, middlewares
├── constants/               # HttpStatus, HttpMessages
├── di/                      # Dependency injection container
├── errors/                  # Shared application errors
├── types/                   # Shared types
└── utils/                   # Logger, env vars
```
