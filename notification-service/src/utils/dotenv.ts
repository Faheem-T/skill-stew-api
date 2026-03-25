const envVars = [
  "PORT",
  "DATABASE_URL",
  "RABBIT_MQ_CONNECTION_STRING",
  "RABBIT_MQ_EXCHANGE_NAME",
  "RABBIT_MQ_QUEUE_NAME",
  "REDIS_URI",
  "RESEND_API_KEY",
  "EMAIL_VERIFICATION_REDIRECT_URL",
  "NODE_MAILER_HOST",
  "NODE_MAILER_PORT",
  "NODE_MAILER_GMAIL",
  "NODE_MAILER_GMAIL_APP_PASSWORD",
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
