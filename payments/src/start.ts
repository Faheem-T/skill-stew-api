import { ENV } from "./config/dotenv";
import { app } from "./app";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({ connectionString: ENV.DATABASE_URL }),
});

async function start() {
  try {
    console.log("Attempting to ping database...");
    await db.execute("select 1");
    console.log("Successfully pinged database");
  } catch (err) {
    console.log("Error while pinging database", err);
  }
  console.log("Connected to database");

  app.listen(ENV.PORT, () => {
    console.log(`Listening on port ${ENV.PORT}`);
  });
}
start();

// Disconnect from db when process is exiting
process.on("exit", async () => {
  await db.$client.end();
  console.log("Disconnected from database");
});
