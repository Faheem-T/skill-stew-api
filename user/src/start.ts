import { ENV } from "./utils/dotenv";
import { app } from "./app";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { logger } from "./presentation/logger";
import { mapDrizzleError } from "./infrastructure/mappers/ErrorMapper";
import { initializeUsernameBloomfilterUsecase } from "./di";

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({ connectionString: ENV.DATABASE_URL }),
});

async function start() {
  try {
    logger.info("Attempting to ping database...");
    await db.execute("select 1");
    logger.info("Successfully pinged database");
  } catch (err) {
    logger.error("Error while pinging database", err);
    throw mapDrizzleError(err);
  }
  logger.info("Connected to database");

  await initializeUsernameBloomfilterUsecase.exec();

  app.listen(ENV.PORT, () => {
    logger.info(`Listening on port ${ENV.PORT}`);
  });
}
start();

// Disconnect from db when process is exiting
process.on("exit", async () => {
  await db.$client.end();
  logger.info("Disconnected from database");
});
