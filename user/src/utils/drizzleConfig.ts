import { defineConfig } from "drizzle-kit";
import { ENV } from "./dotenv";

export default defineConfig({
  dialect: "postgresql",
  schema: "src/2-infrastructure/db/schemas",
  dbCredentials: {
    url: ENV.DATABASE_URL,
    user: "postgres",
  },
});
