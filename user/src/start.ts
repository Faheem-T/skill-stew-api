import { ENV } from "./utils/dotenv";
import { app } from "./app";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import amqp from "amqplib";
import { consumer, producer } from "./di";
import { UserRegisteredEvent } from "@skillstew/common";
import { logger } from "./presentation/logger";

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({ connectionString: ENV.DATABASE_URL }),
});

// Events that this service is interested in
const INTERESTED_EVENTS = ["user.registered"];

async function start() {
  try {
    logger.info("Attempting to ping database...");
    await db.execute("select 1");
    logger.info("Successfully pinged database");
  } catch (err) {
    logger.error("Error while pinging database", err);
  }
  logger.info("Connected to database");

  await initializeMessageQueue();

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

async function initializeMessageQueue() {
  const connection = await amqp.connect(
    `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@my-rabbit`,
  );
  const channel = await connection.createChannel();

  await producer.init(channel, "stew_exchange");
  await consumer.init(channel, "stew_exchange", "user", INTERESTED_EVENTS);

  // for testing
  consumer.registerHandler(
    "user.registered",
    async (event: UserRegisteredEvent) => {
      logger.info("Received user.registered event: \n", event);
      return { success: true };
    },
  );
  logger.info("Producer and Consumer setup complete.");
}
