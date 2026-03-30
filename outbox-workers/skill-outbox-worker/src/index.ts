import amqp from "amqplib";
import mongoose from "mongoose";
import { CreateEvent, EventName, EventSchemas } from "@skillstew/common";
import { ENV } from "./utils/dotenv";
import { logger } from "./utils/logger";
import { OutboxEventModel } from "./models/outboxEventModel";

process.on("uncaughtException", (err, origin) => {
  logger.error(
    "Critical application error. Exiting process with status code 1.",
    { err, origin },
  );
  process.exit(1);
});

function isValidEventName(value: unknown): value is EventName {
  return EventName.includes(value as EventName);
}

const EXCHANGE_NAME = "stew_exchange";
const connection = await amqp.connect(ENV.RABBIT_MQ_CONNECTION_STRING);
const channel = await connection.createChannel();
await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
logger.info("Connected to rabbitmq!");

await mongoose.connect(ENV.DATABASE_URL);
await mongoose.connection.db?.admin().command({ ping: 1 });
logger.info("Connected to database!");
logger.info("Skill service outbox worker up and running!");

const PENDING_FETCH_LIMIT = 20;
const pollIntervalMs = Number(ENV.POLL_INTERVAL_MS);
const intervalMs = Number.isFinite(pollIntervalMs) ? pollIntervalMs : 5000;

let intervalId: Timer;

async function shutdown() {
  logger.info("Shutting down gracefully...");
  clearInterval(intervalId);
  await channel.close();
  await connection.close();
  await mongoose.connection.close();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

intervalId = setInterval(async () => {
  try {
    const rows = await OutboxEventModel.find({ status: "PENDING" })
      .sort({ created_at: 1 })
      .limit(PENDING_FETCH_LIMIT)
      .exec();

    for (const row of rows) {
      const { _id: id, event_name, payload } = row;

      if (!isValidEventName(event_name)) {
        logger.error(`Unknown event ${event_name}. Not publishing.`, {
          payload,
          eventId: id,
        });
        await OutboxEventModel.findByIdAndUpdate(id, {
          status: "PROCESSED",
          processed_at: new Date(),
        });
        continue;
      }

      const schema = EventSchemas[event_name];
      const result = schema.safeParse(payload);
      if (!result.success) {
        logger.error(`Invalid payload for ${event_name}.`, {
          payload,
          eventId: id,
          error: result.error,
        });
        await OutboxEventModel.findByIdAndUpdate(id, {
          status: "PROCESSED",
          processed_at: new Date(),
        });
        continue;
      }

      const event = CreateEvent(event_name, result.data, "skill-service");
      const routingKey = event.eventName;
      const message = Buffer.from(JSON.stringify(event));

      try {
        channel.publish(EXCHANGE_NAME, routingKey, message, { persistent: true });
        await OutboxEventModel.findByIdAndUpdate(id, {
          status: "PROCESSED",
          processed_at: new Date(),
        });
        logger.info(`Processed ${event_name} successfully`, { eventId: id });
      } catch (err) {
        logger.error(`Failed to publish ${event_name}`, {
          eventId: id,
          error: err,
        });
      }
    }
  } catch (err) {
    logger.error("Error in outbox processing loop", err);
  }
}, intervalMs);
