import amqp from "amqplib";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { ENV } from "./utils/dotenv";
import { logger } from "./utils/logger";

const EXCHANGE_NAME = "stew_exchange";
const connection = await amqp.connect(ENV.RABBIT_MQ_CONNECTION_STRING);
const channel = await connection.createChannel();
await channel.assertExchange(EXCHANGE_NAME, "topic", {
  durable: true,
});
logger.info("Connected to rabbitmq!");

const { Pool } = pg;

export const db = drizzle({
  client: new Pool({ connectionString: ENV.DATABASE_URL }),
});

try {
  logger.info("Attempting to ping database...");
  await db.execute("select 1");
  logger.info("Successfully pinged database");
} catch (err) {
  logger.error("Error while pinging database", err);
  throw err;
}

logger.info("Connected to database!");

setInterval(() => {
  // fetch PENDING events
  // for each event
  // verify name is valid
  // verify payload is valid using EventMap from common package
  // log event
  // publish to rabbitmq
  // mark processed in db
}, 5000);

