import { authMiddleware } from "../middlewares/authMiddleware";
import { routeGroups } from "../config/routeManifest";
import {
  createAccessToken,
  createResponseMock,
  createTestEnv,
  runMiddleware,
} from "./helpers";

function getGroup(prefix: string) {
  const group = routeGroups.find((entry) => entry.prefix === prefix);
  expect(group).toBeDefined();
  return group;
}

describe("authMiddleware", () => {
  it("lets public routes pass through without authentication", async () => {
    const env = createTestEnv();
    const middleware = authMiddleware(getGroup("/api/v1/auth")!, env);
    const req: {
      method: string;
      originalUrl: string;
      headers: Record<string, string>;
      user?: unknown;
    } = {
      method: "POST",
      originalUrl: "/api/v1/auth/login",
      headers: {},
    };
    const res = createResponseMock();

    const result = await runMiddleware(middleware, req, res);

    expect(result.nextCalled).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(req.user).toBeUndefined();
  });

  it("rejects missing tokens for protected routes", async () => {
    const env = createTestEnv();
    const middleware = authMiddleware(getGroup("/api/v1/connections")!, env);
    const req: {
      method: string;
      originalUrl: string;
      headers: Record<string, string>;
      user?: unknown;
    } = {
      method: "POST",
      originalUrl: "/api/v1/connections/user-123",
      headers: {},
    };
    const res = createResponseMock();

    const result = await runMiddleware(middleware, req, res);

    expect(result.nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      success: false,
      errors: [{ message: "You are not authenticated" }],
    });
  });

  it("attaches req.user for valid protected requests", async () => {
    const env = createTestEnv();
    const middleware = authMiddleware(getGroup("/api/v1/connections")!, env);
    const accessToken = createAccessToken(
      env,
      {
        userId: "user-123",
        email: "user@example.com",
        role: "USER",
      },
    );
    const req: {
      method: string;
      originalUrl: string;
      headers: Record<string, string>;
      user?: unknown;
    } = {
      method: "POST",
      originalUrl: "/api/v1/connections/user-456",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
    const res = createResponseMock();

    const result = await runMiddleware(middleware, req, res);

    expect(result.nextCalled).toBe(true);
    expect(req.user).toEqual({
      id: "user-123",
      email: "user@example.com",
      role: "USER",
    });
  });

  it("enforces route overrides that are narrower than the group default", async () => {
    const env = createTestEnv();
    const middleware = authMiddleware(getGroup("/api/v1/me")!, env);
    const accessToken = createAccessToken(
      env,
      {
        userId: "expert-123",
        email: "expert@example.com",
        role: "EXPERT",
      },
    );
    const req: {
      method: string;
      originalUrl: string;
      headers: Record<string, string>;
      user?: unknown;
    } = {
      method: "PATCH",
      originalUrl: "/api/v1/me",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
    const res = createResponseMock();

    const result = await runMiddleware(middleware, req, res);

    expect(result.nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      success: false,
      errors: [{ message: "You do not have the permission to access this." }],
    });
  });

  it("returns a structured unauthorized response for invalid tokens", async () => {
    const env = createTestEnv();
    const middleware = authMiddleware(getGroup("/api/v1/connections")!, env);
    const req: {
      method: string;
      originalUrl: string;
      headers: Record<string, string>;
      user?: unknown;
    } = {
      method: "PATCH",
      originalUrl: "/api/v1/connections/user-456",
      headers: {
        authorization: "Bearer invalid-token",
      },
    };
    const res = createResponseMock();

    const result = await runMiddleware(middleware, req, res);

    expect(result.nextCalled).toBe(false);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({
      success: false,
      errors: [{ message: "Invalid token" }],
      code: "INVALID_TOKEN_ERROR",
    });
  });

  it("requires an expert token for workshop routes", async () => {
    const env = createTestEnv();
    const middleware = authMiddleware(getGroup("/api/v1/workshops")!, env);
    const accessToken = createAccessToken(env, {
      userId: "user-123",
      email: "user@example.com",
      role: "USER",
    });
    const req: {
      method: string;
      originalUrl: string;
      headers: Record<string, string>;
      user?: unknown;
    } = {
      method: "POST",
      originalUrl: "/api/v1/workshops",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
    const res = createResponseMock();

    const result = await runMiddleware(middleware, req, res);

    expect(result.nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      success: false,
      errors: [{ message: "You do not have the permission to access this." }],
    });
  });

  it("requires a user token for cohort enrollment routes", async () => {
    const env = createTestEnv();
    const middleware = authMiddleware(getGroup("/api/v1/cohorts")!, env);
    const accessToken = createAccessToken(env, {
      userId: "expert-123",
      email: "expert@example.com",
      role: "EXPERT",
    });
    const req: {
      method: string;
      originalUrl: string;
      headers: Record<string, string>;
      user?: unknown;
    } = {
      method: "POST",
      originalUrl: "/api/v1/cohorts/cohort-123/enrollments",
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    };
    const res = createResponseMock();

    const result = await runMiddleware(middleware, req, res);

    expect(result.nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      success: false,
      errors: [{ message: "You do not have the permission to access this." }],
    });
  });
});
