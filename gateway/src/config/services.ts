import { Env } from "./env";

export type ServiceName =
  | "user"
  | "payments"
  | "skill"
  | "search"
  | "notification";

export function buildServiceTargets(env: Env): Record<ServiceName, string> {
  return {
    user: env.USER_SERVICE_URL,
    payments: env.PAYMENTS_SERVICE_URL,
    skill: env.SKILL_SERVICE_URL,
    search: env.SEARCH_SERVICE_URL,
    notification: env.NOTIFICATION_SERVICE_URL,
  };
}
