const envVars = [
  "USER_SERVICE_URL",
  "PAYMENTS_SERVICE_URL",
  "SKILL_SERVICE_URL",
  "USER_ACCESS_TOKEN_SECRET",
  "EXPERT_ACCESS_TOKEN_SECRET",
  "ADMIN_ACCESS_TOKEN_SECRET",
  "SEARCH_SERVICE_URL",
  "NOTIFICATION_SERVICE_URL",
] as const;

export type Env = Record<(typeof envVars)[number], string> & {
  PORT?: string;
  LOG_LEVEL?: string;
  NODE_ENV?: string;
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const env = {} as Env;

  for (const key of envVars) {
    const value = source[key];
    if (!value) {
      throw new Error(`Env variable not set: ${key}`);
    }
    env[key] = value;
  }

  env.PORT = source.PORT;
  env.LOG_LEVEL = source.LOG_LEVEL;
  env.NODE_ENV = source.NODE_ENV;

  return env;
}

export const ENV = loadEnv();
