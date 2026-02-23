const envVars = [
  "PORT",
  "DATABASE_URL",
  "RABBIT_MQ_CONNECTION_STRING",
  "RABBIT_MQ_EXCHANGE_NAME",
  "RABBIT_MQ_QUEUE_NAME",
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
