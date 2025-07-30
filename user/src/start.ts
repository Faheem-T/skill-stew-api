import { ENV } from "./config/dotenv";
import { app } from "./app";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { userSchema } from "./2-infrastructure/db/schemas/userSchema";
import amqp from "amqplib";
import { consumer, producer } from "./di";
import { UserRegisteredEvent } from "@skillstew/common";

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({ connectionString: ENV.DATABASE_URL }),
});

// Events that this service is interested in
const INTERESTED_EVENTS = ["user.registered"];

async function start() {
  try {
    console.log("Attempting to ping database...");
    await db.execute("select 1");
    console.log("Successfully pinged database");
  } catch (err) {
    console.log("Error while pinging database", err);
  }
  console.log("Connected to database");

  await initializeMessageQueue();

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
      console.log("Received user.registered event: \n", event);
      return { success: true };
    },
  );
  console.log("Producer and Consumer setup complete.");
}
