# API Gateway

The API Gateway is the single entry point for client requests. It performs JWT authentication and role checks, then proxies requests to backend services through [`http-proxy-middleware`](https://github.com/chimurai/http-proxy-middleware).

**Runtime:** Node.js (tsx)  
**Package Manager:** pnpm  
**Infisical Path:** `/api-gateway`

## Routing Model

The gateway is configured through a single route manifest. Each entry represents a **prefix group**:

- `prefix`: the incoming API prefix handled by the gateway
- `service`: the backend service that receives requests for that prefix
- `auth`: the default auth policy for that prefix
- `overrides`: optional method + path exceptions for routes that need different auth rules

This keeps routing and authorization in one place.

## How Requests Flow

```text
Client -> Gateway -> Backend Service
          |  auth policy from route manifest
          |  JWT verification when required
          v
   x-user-id / x-user-role headers
```

For a request like `POST /api/v1/connections/:userId`:

1. The gateway matches the `/api/v1/connections` route group
2. The group's auth policy is resolved, including any override match
3. If the route is protected, the gateway verifies the access token
4. The gateway forwards the request to the configured service target
5. If authentication succeeded, `x-user-id` and `x-user-role` are injected

## Environment Variables

Use **base service URLs**, not route-specific URLs:

| Variable                      | Description                            |
| ----------------------------- | -------------------------------------- |
| `PORT`                        | Gateway port                           |
| `USER_SERVICE_URL`            | Base URL of the user service           |
| `SKILL_SERVICE_URL`           | Base URL of the skill service          |
| `SEARCH_SERVICE_URL`          | Base URL of the ES proxy service       |
| `NOTIFICATION_SERVICE_URL`    | Base URL of the notification service   |
| `PAYMENTS_SERVICE_URL`        | Base URL of the payments service       |
| `USER_ACCESS_TOKEN_SECRET`    | JWT access token secret (USER role)    |
| `EXPERT_ACCESS_TOKEN_SECRET`  | JWT access token secret (EXPERT role)  |
| `ADMIN_ACCESS_TOKEN_SECRET`   | JWT access token secret (ADMIN role)   |

Example:

```env
USER_SERVICE_URL=http://user-srv.default.svc.cluster.local:3000
SKILL_SERVICE_URL=http://skill-srv.default.svc.cluster.local:3000
SEARCH_SERVICE_URL=http://es-proxy.default.svc.cluster.local:3000
NOTIFICATION_SERVICE_URL=http://notification-srv.default.svc.cluster.local:3000
PAYMENTS_SERVICE_URL=http://payments-srv.default.svc.cluster.local:3000
```

The gateway preserves the original request path when proxying, so:

- `POST /api/v1/auth/login` -> `${USER_SERVICE_URL}/api/v1/auth/login`
- `PATCH /api/v1/me` -> `${USER_SERVICE_URL}/api/v1/me`

## Current Prefix Map

| Prefix                  | Backend Service | Default Auth |
| ----------------------- | --------------- | ------------ |
| `/api/v1/auth`          | User            | Public       |
| `/api/v1/me`            | User            | Protected    |
| `/api/v1/users`         | User            | Public       |
| `/api/v1/connections`   | User            | Protected    |
| `/api/v1/skills`        | Skill           | Public       |
| `/api/v1/search`        | ES Proxy        | Public       |
| `/api/v1/notifications` | Notification    | Protected    |
| `/api/v1/payments`      | Payments        | Public       |

Some prefixes have overrides. Example:

- `/api/v1/users` is public by default
- `GET /api/v1/users` is restricted to `ADMIN`
- `PATCH /api/v1/users/onboarding/profile` is restricted to `USER`

## Adding a New Feature Route

1. If the new route fits an existing prefix and shares its default auth rule, no gateway change is needed
2. If it fits an existing prefix but needs different auth, add an override to the prefix group
3. If it belongs to a new backend area, add a new prefix group and point it at the correct service

This is the main reason for the refactor: most feature work should not require gateway surgery.

## Testing

Run:

```bash
cd gateway && npm test
```

The tests cover:

- route-manifest auth resolution
- public vs protected routing
- role-restricted overrides
- header forwarding to upstream services
- unknown route handling
- upstream proxy failures
