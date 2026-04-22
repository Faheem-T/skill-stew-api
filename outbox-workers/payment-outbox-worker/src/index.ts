import amqp from "amqplib";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { CreateEvent, EventName, EventSchemas } from "@skillstew/common";
import { outboxEventsTable } from "./db/schemas/outboxEventSchema";
import { ENV } from "./utils/dotenv";
import { logger } from "./utils/logger";

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
const rabbitConnection = await amqp.connect(ENV.RABBIT_MQ_CONNECTION_STRING);
const channel = await rabbitConnection.createChannel();
await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
logger.info("Connected to rabbitmq");

const { Pool } = pg;

const db = drizzle({
  client: new Pool({ connectionString: ENV.DATABASE_URL }),
});

logger.info("Attempting to ping database...");
await db.execute("select 1");
logger.info("Connected to database");
logger.info("Payment service outbox worker up and running");

const PENDING_FETCH_LIMIT = 20;

const pollIntervalMs = Number(ENV.POLL_INTERVAL_MS);
const intervalMs = Number.isFinite(pollIntervalMs) ? pollIntervalMs : 5000;

let intervalId: Timer;

async function shutdown() {
  logger.info("Shutting down gracefully...");
  clearInterval(intervalId);
  await channel.close();
  await rabbitConnection.close();
  await db.$client.end();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

intervalId = setInterval(async () => {
  try {
    const rows = await db
      .select()
      .from(outboxEventsTable)
      .where(eq(outboxEventsTable.status, "PENDING"))
      .limit(PENDING_FETCH_LIMIT);

    for (const row of rows) {
      const { id, event_name, payload } = row;

      if (!isValidEventName(event_name)) {
        logger.error(`Unknown event ${event_name}. Marking processed.`, {
          payload,
          eventId: id,
        });

        await db
          .update(outboxEventsTable)
          .set({ status: "PROCESSED", processed_at: new Date() })
          .where(eq(outboxEventsTable.id, id));

        continue;
      }

      const schema = EventSchemas[event_name];
      const result = schema.safeParse(payload);
      if (!result.success) {
        logger.error(`Invalid payload for ${event_name}. Marking processed.`, {
          payload,
          eventId: id,
          error: result.error,
        });

        await db
          .update(outboxEventsTable)
          .set({ status: "PROCESSED", processed_at: new Date() })
          .where(eq(outboxEventsTable.id, id));

        continue;
      }

      const event = CreateEvent(event_name, result.data, "payments-service");

      try {
        channel.publish(
          EXCHANGE_NAME,
          event.eventName,
          Buffer.from(JSON.stringify(event)),
          { persistent: true },
        );

        await db
          .update(outboxEventsTable)
          .set({ status: "PROCESSED", processed_at: new Date() })
          .where(eq(outboxEventsTable.id, id));

        logger.info(`Published ${event_name}`, { eventId: id });
      } catch (error) {
        logger.error(`Failed to publish ${event_name}`, {
          eventId: id,
          error,
        });
      }
    }
  } catch (error) {
    logger.error("Error in payment outbox processing loop", { error });
  }
}, intervalMs);
