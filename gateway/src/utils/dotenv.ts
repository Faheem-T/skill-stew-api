const envVars = [
  "USER_SERVICE_URL",
  "AUTH_SERVICE_URL",
  "PAYMENTS_SERVICE_URL",
  "SKILL_SERVICE_URL",
  "USER_ACCESS_TOKEN_SECRET",
  "USER_REFRESH_TOKEN_SECRET",
  "EXPERT_ACCESS_TOKEN_SECRET",
  "EXPERT_REFRESH_TOKEN_SECRET",
  "ADMIN_ACCESS_TOKEN_SECRET",
  "ADMIN_REFRESH_TOKEN_SECRET",
  "SEARCH_SERVICE_URL",
  "ME_SERVICE_URL",
] as const;

function generateEnvVars() {
  return envVars.reduce(
    (acc, key) => {
      const val = process.env[key];
      if (!val) {
        throw new Error(`Env variable not set! variable name: ${key} : ${val}`);
      }
      acc[key] = val;
      return acc;
    },
    {} as Record<(typeof envVars)[number], string>,
  );
}

export const ENV = generateEnvVars();
