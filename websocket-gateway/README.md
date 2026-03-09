# WebSocket Gateway

The WebSocket Gateway is responsible for managing persistent client WebSocket connections using [Socket.IO](https://socket.io/). It acts as the real-time delivery mechanism for the entire SkillStew platform.

**Runtime:** Bun  
**Database:** None (uses Redis for pub/sub)  
**Infisical Path:** `/websocket-gateway`

## Architecture

This service is intentionally **stateless and minimal**. It does not listen to RabbitMQ or directly query any databases. Instead, it relies on the `@socket.io/redis-adapter` to receive messages from other backend services.

### The Real-Time Push Flow

1. A client connects to the WebSocket Gateway.
2. The Gateway authenticates the client via JWT and joins their connection to a specific Socket.IO room (e.g., `user:0191836c-b26a-723e-876a-5432d567a98c`).
3. When an event occurs in another service (like the Notification Service wanting to send an alert), that service uses `@socket.io/redis-emitter` to publish an event directly to the user's room via Redis.
4. The Redis adapter on the Gateway picks up the message and pushes it out to the connected client.

This design decouples event processing from connection management. Backend services can emit real-time events without needing to hold persistent WebSocket connections or track which gateway instance a user is connected to.

## Authentication

WebSocket connections are authenticated using the same **role-based JWT access tokens** as the HTTP API Gateway.

The client must pass the token during the initial connection handshake:

```js
// Client-side example
const socket = io("ws://gateway-url/socket.io", {
  auth: {
    token: "Bearer eyJhbGciOiJIUzI1NiIs...",
  },
});
```

If the token is invalid, expired, or missing, the connection is immediately rejected. Once authenticated, the user's details (`id`, `email`, `role`) are attached to the socket session.

## Environment Variables

| Variable                     | Description                             |
| ---------------------------- | --------------------------------------- |
| `PORT`                       | Service port                            |
| `REDIS_URI`                  | Redis connection string for the adapter |
| `USER_ACCESS_TOKEN_SECRET`   | JWT access token secret (USER role)     |
| `EXPERT_ACCESS_TOKEN_SECRET` | JWT access token secret (EXPERT role)   |
| `ADMIN_ACCESS_TOKEN_SECRET`  | JWT access token secret (ADMIN role)    |

## Directory Structure

```
websocket-gateway/src/
├── start.ts                 # Express/Socket.io server setup and Redis adapter config
├── middlewares/
│   └── authMiddleware.ts    # Handshake authentication and JWT validation
├── utils/
│   ├── JwtService.ts        # Role-based token verification
│   ├── dotenv.ts            # Env var definition and validation
│   └── logger.ts            # Winston logger
├── constants/               # HttpMessages
├── errors/                  # JWT-specific error classes
└── types/                   # Custom type definitions (UserRoles)
```
