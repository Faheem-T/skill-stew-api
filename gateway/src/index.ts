import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { logger } from "./logger";
import { ENV } from "./dotenv";

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
    url: ENV.USER_SERVICE_URL,
    name: "auth-service",
  },
  {
    path: "/api/v1/payments",
    url: ENV.PAYMENTS_SERVICE_URL,
    name: "payments-service",
  },
];

ServiceConfigs.forEach((service) => {
  app.use(
    service.path,
    createProxyMiddleware({
      target: service.url,
      changeOrigin: true,
      on: {
        proxyReq: (proxyReq, req, res) => {
          logger.info(`Request for ${service.name}`);
        },
        proxyRes: (proxyRes, req, res) => {},
      },
    }),
  );
});

app.use((req, res) => {
  res.json({ message: "Hello there :)" });
});

app.listen(port, () => {
  logger.info(`Listening on port ${port}`);
});
