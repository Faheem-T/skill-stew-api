import express, { RequestHandler } from "express";
import {
  createProxyMiddleware,
  Options,
} from "http-proxy-middleware";
import { Request } from "express";
import { HttpStatus } from "../constants/HttpStatus";
import { authMiddleware } from "../middlewares/authMiddleware";
import { RouteGroup, routeGroups } from "../config/routeManifest";
import { buildServiceTargets } from "../config/services";
import { Env } from "../config/env";
import { logger } from "../utils/logger";

export function buildProxyOptions(group: RouteGroup, target: string): Options {
  return {
    target: new URL(group.prefix, target).toString(),
    changeOrigin: true,
    proxyTimeout: 10_000,
    timeout: 10_000,
    on: {
      error: (error, req, res) => {
        logger.error("Proxy error", {
          service: group.service,
          path: req.url,
          error,
        });

        if (!("headersSent" in res) || res.headersSent) {
          return;
        }

        res.writeHead(HttpStatus.BAD_GATEWAY, {
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify({
            success: false,
            errors: [{ message: "Upstream service unavailable" }],
          }),
        );
      },
      proxyReq: (proxyReq, req) => {
        const request = req as Request;

        logger.info("Proxying request", {
          service: group.service,
          method: request.method,
          path: request.originalUrl,
          ...(request.user
            ? { userId: request.user.id, role: request.user.role }
            : {}),
        });

        if (request.user) {
          proxyReq.setHeader("x-user-id", request.user.id);
          proxyReq.setHeader("x-user-role", request.user.role);
        }
      },
    },
  };
}

type ProxyFactory = (options: Options) => RequestHandler;

export function createApp(
  env: Env,
  proxyFactory: ProxyFactory = createProxyMiddleware,
) {
  const app = express();
  const serviceTargets = buildServiceTargets(env);

  for (const group of routeGroups) {
    app.use(
      group.prefix,
      authMiddleware(group, env),
      proxyFactory(buildProxyOptions(group, serviceTargets[group.service])),
    );
  }

  app.use((_req, res) => {
    res.status(HttpStatus.NOT_FOUND).json({
      success: false,
      errors: [{ message: "Route not found" }],
    });
  });

  return app;
}
