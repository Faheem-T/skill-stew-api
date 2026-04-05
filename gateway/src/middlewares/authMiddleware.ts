import { RequestHandler } from "express";
import {
  AccessTokenVerifyError,
  InvalidTokenError,
  InvalidTokenRoleError,
  TokenRoleMismatchError,
} from "../errors/JwtErrors";
import { HttpStatus } from "../constants/HttpStatus";
import { RouteGroup, resolveAuthPolicy } from "../config/routeManifest";
import { Env } from "../config/env";
import { HTTPMethod } from "../types/HTTPMethod";
import { JwtService } from "../utils/JwtService";
import { logger } from "../utils/logger";

function createJwtService(env: Env): JwtService {
  return new JwtService({
    adminAccessTokenSecret: env.ADMIN_ACCESS_TOKEN_SECRET,
    expertAccessTokenSecret: env.EXPERT_ACCESS_TOKEN_SECRET,
    userAccessTokenSecret: env.USER_ACCESS_TOKEN_SECRET,
  });
}

function unauthorized(
  res: Parameters<RequestHandler>[1],
  message: string,
  code?: string,
) {
  res.status(HttpStatus.UNAUTHORIZED).json({
    success: false,
    errors: [{ message }],
    ...(code ? { code } : {}),
  });
}

function forbidden(res: Parameters<RequestHandler>[1], message: string) {
  res.status(HttpStatus.FORBIDDEN).json({
    success: false,
    errors: [{ message }],
  });
}

export function authMiddleware(group: RouteGroup, env: Env): RequestHandler {
  const jwtService = createJwtService(env);

  return (req, res, next) => {
    const method = req.method as HTTPMethod;
    const path = req.originalUrl.split("?")[0];
    const policy = resolveAuthPolicy(path, method, group);

    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        if (!policy.required) {
          next();
          return;
        }

        logger.warn("Blocking access due to missing token", {
          method,
          path,
          service: group.service,
        });
        unauthorized(res, "You are not authenticated");
        return;
      }

      const payload = jwtService.verifyAccessToken(token);
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      if (policy.required && !policy.roles.includes(payload.role)) {
        logger.warn("Blocking access due to role mismatch", {
          method,
          path,
          service: group.service,
          role: payload.role,
        });
        forbidden(res, "You do not have the permission to access this.");
        return;
      }

      next();
    } catch (error) {
      if (
        error instanceof AccessTokenVerifyError ||
        error instanceof InvalidTokenError ||
        error instanceof InvalidTokenRoleError ||
        error instanceof TokenRoleMismatchError
      ) {
        logger.warn("Blocking access due to invalid token", {
          method,
          path,
          service: group.service,
          code: error.code,
        });
        unauthorized(res, error.message, error.code);
        return;
      }

      next(error);
    }
  };
}
