const envVars = [
  "RABBIT_MQ_CONNECTION_STRING",
  "DATABASE_URL",
  "POLL_INTERVAL_MS",
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
