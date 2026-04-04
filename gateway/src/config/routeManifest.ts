import { match } from "path-to-regexp";
import { HTTPMethod } from "../types/HTTPMethod";
import { UserRoles } from "../types/UserRoles";
import { ServiceName } from "./services";

type PublicAuthPolicy = {
  required: false;
};

type ProtectedAuthPolicy = {
  required: true;
  roles: UserRoles[];
};

export type AuthPolicy = PublicAuthPolicy | ProtectedAuthPolicy;

export interface RouteOverride {
  method: HTTPMethod;
  path: string;
  auth: AuthPolicy;
}

export interface RouteGroup {
  prefix: string;
  service: ServiceName;
  auth: AuthPolicy;
  overrides?: RouteOverride[];
}

export const routeGroups: RouteGroup[] = [
  {
    prefix: "/api/v1/auth",
    service: "user",
    auth: { required: false },
  },
  {
    prefix: "/api/v1/me",
    service: "user",
    auth: {
      required: true,
      roles: ["USER", "EXPERT", "ADMIN", "EXPERT_APPLICANT"],
    },
    overrides: [
      {
        method: "PATCH",
        path: "/api/v1/me",
        auth: { required: true, roles: ["USER"] },
      },
    ],
  },
  {
    prefix: "/api/v1/users",
    service: "user",
    auth: { required: false },
    overrides: [
      {
        method: "GET",
        path: "/api/v1/users",
        auth: { required: true, roles: ["ADMIN"] },
      },
      {
        method: "POST",
        path: "/api/v1/users/dummy",
        auth: { required: true, roles: ["ADMIN"] },
      },
      {
        method: "PATCH",
        path: "/api/v1/users/:id/block-status",
        auth: { required: true, roles: ["ADMIN"] },
      },
      {
        method: "PATCH",
        path: "/api/v1/users/onboarding/profile",
        auth: { required: true, roles: ["USER"] },
      },
    ],
  },
  {
    prefix: "/api/v1/connections",
    service: "user",
    auth: { required: true, roles: ["USER", "EXPERT", "ADMIN"] },
  },
  {
    prefix: "/api/v1/payments",
    service: "payments",
    auth: { required: false },
  },
  {
    prefix: "/api/v1/skills",
    service: "skill",
    auth: { required: false },
    overrides: [
      {
        method: "GET",
        path: "/api/v1/skills/profile/me",
        auth: { required: true, roles: ["USER"] },
      },
      {
        method: "PUT",
        path: "/api/v1/skills/profile",
        auth: { required: true, roles: ["USER"] },
      },
    ],
  },
  {
    prefix: "/api/v1/workshops",
    service: "skill",
    auth: { required: true, roles: ["EXPERT"] },
  },
  {
    prefix: "/api/v1/cohorts",
    service: "skill",
    auth: { required: true, roles: ["EXPERT"] },
    overrides: [
      {
        method: "POST",
        path: "/api/v1/cohorts/:id/enrollments",
        auth: { required: true, roles: ["USER"] },
      },
    ],
  },
  {
    prefix: "/api/v1/search",
    service: "search",
    auth: { required: false },
    overrides: [
      {
        method: "GET",
        path: "/api/v1/search/users/recommended",
        auth: { required: true, roles: ["USER"] },
      },
    ],
  },
  {
    prefix: "/api/v1/notifications",
    service: "notification",
    auth: {
      required: true,
      roles: ["USER", "EXPERT", "ADMIN", "EXPERT_APPLICANT"],
    },
  },
  {
    prefix: "/api/v1/experts",
    service: "user",
    auth: { required: true, roles: ["EXPERT", "ADMIN"] },
  },
  {
    prefix: "/api/v1/expert-applications",
    service: "user",
    auth: { required: true, roles: ["ADMIN"] },
    overrides: [
      {
        method: "POST",
        path: "/api/v1/expert-applications/apply",
        auth: { required: true, roles: ["EXPERT_APPLICANT"] },
      },
    ],
  },
];

export function getMatchingRouteGroup(path: string): RouteGroup | undefined {
  return routeGroups.find(
    (group) => path === group.prefix || path.startsWith(`${group.prefix}/`),
  );
}

export function resolveAuthPolicy(
  path: string,
  method: HTTPMethod,
  group: RouteGroup,
): AuthPolicy {
  for (const routeOverride of group.overrides ?? []) {
    if (routeOverride.method !== method) {
      continue;
    }

    const matcher = match(routeOverride.path);
    if (matcher(path)) {
      return routeOverride.auth;
    }
  }

  return group.auth;
}
