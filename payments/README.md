# Payments Service

The payments service handles Stripe-backed payment session creation and webhook processing for paid cohort enrollment.

**Runtime:** Node.js (tsx)  
**Database:** PostgreSQL (Drizzle ORM) - _Tables TBA_  
**Infisical Path:** `/payments-service`

## API Endpoints

Public routes are prefixed with `/api/v1/payments` and routed through the API Gateway. Internal service-to-service routes stay under `/internal/payments`.

| Method | Path                | Description                                                              |
| ------ | ------------------- | ------------------------------------------------------------------------ |
| POST   | `/webhooks/stripe`  | Receive Stripe webhook events                                            |

### Internal Routes

| Method | Path                 | Description                      |
| ------ | -------------------- | -------------------------------- |
| POST   | `/checkout-sessions` | Create a Stripe Checkout Session |

## Published Events

Payment events are written to the transactional outbox first and published by the separate `payment-outbox-worker`.

| Event Name          | Trigger                              |
| ------------------- | ------------------------------------ |
| `payment.succeeded` | Stripe marks a checkout payment paid |
| `payment.failed`    | Stripe checkout expires or fails     |
| `payment.refunded`  | Stripe reports a refund              |

## Environment Variables

| Variable                      | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| `PORT`                        | Service port                                         |
| `DATABASE_URL`                | PostgreSQL connection string                         |
| `STRIPE_SECRET_KEY`           | Stripe server-side API key                           |
| `STRIPE_WEBHOOK_SECRET`       | Stripe webhook signing secret                        |
| `FRONTEND_PAYMENT_RETURN_URL` | Frontend return URL used for Checkout success/cancel |

## Directory Structure

```
payments/src/
├── domain/                  # Entities, status enums, repository interfaces
├── application/             # Services, DTOs, interfaces, ports
├── infrastructure/          # DB schemas, repositories, unit of work
├── presentation/            # Express controllers, routers, middlewares
├── constants/               # HttpStatus, HttpMessages
├── di/                      # Dependency injection container
└── types/                   # Shared types
```
