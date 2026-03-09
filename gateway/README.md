# API Gateway

The API Gateway is the single entry point for all client requests. It handles JWT authentication, role-based access control, and request routing to backend services via [`http-proxy-middleware`](https://github.com/chimurai/http-proxy-middleware).

**Runtime:** Node.js (tsx)  
**Package Manager:** pnpm  
**Infisical Path:** `/api-gateway`

## How It Works

```
Client → Gateway (auth + RBAC) → Backend Service
                ↓
        x-user-id header
        x-user-role header
```

1. **Every request** hits the auth middleware first
2. The middleware checks if the path + method combination requires authentication (via the `AuthRequiredEndpoints` map)
3. If auth is required, it verifies the JWT access token and checks that the user's role is in the allowed roles for that endpoint
4. If auth passes, `x-user-id` and `x-user-role` headers are forwarded to the backend service
5. If auth is not required (e.g., login, register), the request is proxied directly

## Route Map

| Path Prefix             | Backend Service      |
| ----------------------- | -------------------- |
| `/api/v1/auth`          | User service         |
| `/api/v1/me`            | User service         |
| `/api/v1/users`         | User service         |
| `/api/v1/connections`   | User service         |
| `/api/v1/skills`        | Skill service        |
| `/api/v1/search`        | ES Proxy service     |
| `/api/v1/notifications` | Notification service |
| `/api/v1/payments`      | Payments service     |

## Authentication & Authorization

The gateway uses **role-based JWT signing keys** — each role (`USER`, `EXPERT`, `ADMIN`) has its own access and refresh token secrets. The JWT's `kid` (Key ID) header identifies which role's secret to use for verification.

The [`isAuthRequired`](src/utils/isAuthRequired.ts) function maintains a declarative map of all protected endpoints:

```ts
{
  GET: [
    { path: "/api/v1/users", roles: ["ADMIN"] },
    { path: "/api/v1/me", roles: ["USER", "ADMIN", "EXPERT"] },
    ...
  ],
  POST: [...],
  PUT: [...],
  PATCH: [...],
  DELETE: [...],
}
```

Unmatched paths are treated as public (no auth required).

## Environment Variables

| Variable                      | Description                            |
| ----------------------------- | -------------------------------------- |
| `PORT`                        | Gateway port                           |
| `USER_SERVICE_URL`            | User service URL                       |
| `AUTH_SERVICE_URL`            | Auth routes URL (user service)         |
| `ME_SERVICE_URL`              | Profile routes URL (user service)      |
| `CONNECTION_SERVICE_URL`      | Connection routes URL (user service)   |
| `SKILL_SERVICE_URL`           | Skill service URL                      |
| `SEARCH_SERVICE_URL`          | ES Proxy service URL                   |
| `NOTIFICATION_SERVICE_URL`    | Notification service URL               |
| `PAYMENTS_SERVICE_URL`        | Payments service URL                   |
| `USER_ACCESS_TOKEN_SECRET`    | JWT access token secret (USER role)    |
| `USER_REFRESH_TOKEN_SECRET`   | JWT refresh token secret (USER role)   |
| `EXPERT_ACCESS_TOKEN_SECRET`  | JWT access token secret (EXPERT role)  |
| `EXPERT_REFRESH_TOKEN_SECRET` | JWT refresh token secret (EXPERT role) |
| `ADMIN_ACCESS_TOKEN_SECRET`   | JWT access token secret (ADMIN role)   |
| `ADMIN_REFRESH_TOKEN_SECRET`  | JWT refresh token secret (ADMIN role)  |

## Directory Structure

```
gateway/src/
├── index.ts                 # Express app, proxy config, service routing
├── middlewares/
│   └── authMiddleware.ts    # JWT verification + RBAC
├── utils/
│   ├── JwtService.ts        # Token verification with role-based secrets
│   ├── isAuthRequired.ts    # Declarative auth endpoint map
│   ├── dotenv.ts            # Env var validation
│   └── logger.ts            # Winston logger
├── constants/               # HttpStatus, HttpMessages
├── errors/                  # JWT-specific error classes
└── types/                   # UserRoles, HTTPMethod, Express augmentation
```
