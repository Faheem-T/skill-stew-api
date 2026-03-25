const envVars = [
  "PORT",
  "DATABASE_URL",
  "EMAIL_VERIFICATON_JWT_SECRET",
  "USER_ACCESS_TOKEN_SECRET",
  "USER_REFRESH_TOKEN_SECRET",
  "EXPERT_ACCESS_TOKEN_SECRET",
  "EXPERT_REFRESH_TOKEN_SECRET",
  "ADMIN_ACCESS_TOKEN_SECRET",
  "ADMIN_REFRESH_TOKEN_SECRET",
  "BASE_SERVER_URL",
  "NODE_ENV",
  "GOOGLE_CLIENT_ID",
  "S3_BUCKET_NAME",
  "CDN_DOMAIN_NAME",
  "RABBIT_MQ_CONNECTION_STRING",
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
