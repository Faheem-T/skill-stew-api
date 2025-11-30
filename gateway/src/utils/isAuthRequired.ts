import { match } from "path-to-regexp";
import { UserRoles } from "../types/UserRoles";
import { HTTPMethod } from "../types/HTTPMethod";

interface Endpoint {
  path: string;
  roles: UserRoles[];
}

type IAuthRequiredEndpoints = {
  [keys in HTTPMethod]?: Endpoint[];
};

const AuthRequiredEndpoints: IAuthRequiredEndpoints = {
  GET: [
    { path: "/api/v1/users", roles: ["ADMIN"] },
    { path: "/api/v1/auth/me", roles: ["USER", "ADMIN", "EXPERT"] },
  ],
  POST: [
    { path: "/api/v1/payments/subscriptions", roles: ["ADMIN"] },
    { path: "/api/v1/users/dummy", roles: ["ADMIN"] },
  ],
  PUT: [{ path: "/api/v1/skills/profile", roles: ["USER"] }],
  PATCH: [
    { path: "/api/v1/users/:id/block", roles: ["ADMIN"] },
    { path: "/api/v1/users/:id/unblock", roles: ["ADMIN"] },
    { path: "/api/v1/payments/subscriptions/:id", roles: ["ADMIN"] },
    { path: "/api/v1/users/profile", roles: ["USER"] },
    { path: "/api/v1/users/onboarding/profile", roles: ["USER"] },
  ],
  DELETE: [{ path: "/api/v1/payments/subscriptions/:id", roles: ["ADMIN"] }],
};

export const isAuthRequired = (
  path: string,
  method: HTTPMethod,
): { matched: boolean; roles: UserRoles[] } => {
  const endpoints = AuthRequiredEndpoints[method] || [];

  for (const endpoint of endpoints) {
    const matcher = match(endpoint.path);
    if (matcher(path)) {
      return { matched: true, roles: endpoint.roles };
    }
  }
  return { matched: false, roles: [] };
};
