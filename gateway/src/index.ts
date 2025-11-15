import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { logger } from "./utils/logger";
import { ENV } from "./utils/dotenv";
import { authMiddleware } from "./middlewares/authMiddleware";

const app = express();
const port = process.env.PORT || 3000;

const ServiceConfigs = [
  {
    path: "/api/v1/users",
    url: ENV.USER_SERVICE_URL,
    name: "user-service",
  },
  {
    path: "/api/v1/auth",
    url: ENV.AUTH_SERVICE_URL,
    name: "auth-service",
  },
  {
    path: "/api/v1/payments",
    url: ENV.PAYMENTS_SERVICE_URL,
    name: "payments-service",
  },
  {
    path: "/api/v1/skills",
    url: ENV.SKILL_SERVICE_URL,
    name: "skill-service",
  },
  {
    path: "/api/v1/search",
    url: ENV.SEARCH_SERVICE_URL,
    name: "search-service",
  },
];

app.use(authMiddleware);

ServiceConfigs.forEach((service) => {
  app.use(
    service.path,
    createProxyMiddleware({
      target: service.url,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req, _res) => {
          const user = (req as any).user;
          logger.info(`Request for ${service.name}`, {
            ...(user ? { userId: user.id, role: user.role } : {}),
          });
          if (user) {
            proxyReq.setHeader("x-user-id", user.id);
            proxyReq.setHeader("x-user-role", user.role);
            if (user.username) {
              proxyReq.setHeader("x-user-username", user.username);
            }
            if (user.email) {
              proxyReq.setHeader("x-user-email", user.email);
            }
          }
        },
        proxyRes: (proxyRes, req, res) => {},
      },
    }),
  );
});

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
