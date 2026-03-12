import jwt from "jsonwebtoken";
import { RequestHandler } from "express";
import { Env } from "../config/env";
import { UserRoles } from "../types/UserRoles";

export function createTestEnv(overrides: Partial<Env> = {}): Env {
  return {
    USER_SERVICE_URL: "http://user-srv.default.svc.cluster.local:3000",
    PAYMENTS_SERVICE_URL: "http://payments-srv.default.svc.cluster.local:3000",
    SKILL_SERVICE_URL: "http://skill-srv.default.svc.cluster.local:3000",
    SEARCH_SERVICE_URL: "http://es-proxy.default.svc.cluster.local:3000",
    NOTIFICATION_SERVICE_URL:
      "http://notification-srv.default.svc.cluster.local:3000",
    USER_ACCESS_TOKEN_SECRET: "user-access-secret",
    EXPERT_ACCESS_TOKEN_SECRET: "expert-access-secret",
    ADMIN_ACCESS_TOKEN_SECRET: "admin-access-secret",
    PORT: "0",
    LOG_LEVEL: "error",
    NODE_ENV: "test",
    ...overrides,
  };
}

export function createAccessToken(
  env: Env,
  payload: { userId: string; email: string; role: UserRoles },
): string {
  const secretByRole: Record<UserRoles, string> = {
    USER: env.USER_ACCESS_TOKEN_SECRET,
    EXPERT: env.EXPERT_ACCESS_TOKEN_SECRET,
    ADMIN: env.ADMIN_ACCESS_TOKEN_SECRET,
  };

  return jwt.sign(payload, secretByRole[payload.role], {
    expiresIn: 60 * 10,
    header: {
      alg: "HS256",
      kid: payload.role,
    },
  });
}

export function createResponseMock() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

export async function runMiddleware(
  middleware: RequestHandler,
  req: Record<string, unknown>,
  res: ReturnType<typeof createResponseMock>,
) {
  let nextCalled = false;
  let nextError: unknown;

  await new Promise<void>((resolve) => {
    middleware(req as never, res as never, (error?: unknown) => {
      nextCalled = true;
      nextError = error;
      resolve();
    });

    // Middleware branches that end the response never call next().
    setImmediate(resolve);
  });

  return { nextCalled, nextError };
}
