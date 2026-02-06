import { defineConfig } from "drizzle-kit";
import { ENV } from "./dotenv";

export default defineConfig({
  dialect: "postgresql",
  schema: "src/infrastructure/db/schemas",
  dbCredentials: {
    url: ENV.DATABASE_URL,
  },
});
