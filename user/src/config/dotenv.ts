const envVars = [
  "PORT",
  "DATABASE_URL",
  "EMAIL_VERIFICATON_JWT_SECRET",
  "NODE_MAILER_HOST",
  "NODE_MAILER_PORT",
  "NODE_MAILER_GMAIL",
  "NODE_MAILER_GMAIL_APP_PASSWORD",
  "BASE_SERVER_URL",
  "BASE_FRONTEND_URL",
] as const;

export function generateEnvVars() {
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
