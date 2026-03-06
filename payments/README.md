# Payments Service (WIP)

The payments service handles payment processing and billing for the platform.

> [!NOTE]
> This service is currently a work in progress. Previously it contained logic for subscription plans, but the subscription model has been removed from the platform. It currently exists as an empty shell waiting for a new payment model to be implemented.

**Runtime:** Node.js (tsx)  
**Database:** PostgreSQL (Drizzle ORM) - _Tables TBA_  
**Infisical Path:** `/payments-service`

## API Endpoints

_None currently. Future endpoints will be prefixed with `/api/v1/payments/`._

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
