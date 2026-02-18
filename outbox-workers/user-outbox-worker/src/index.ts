import amqp from "amqplib";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { ENV } from "./utils/dotenv";
import { logger } from "./utils/logger";
import { outboxEventsTable } from "./db/schemas/outboxEventSchema";
import { CreateEvent, EventName, EventSchemas } from "@skillstew/common";
import { eq } from "drizzle-orm";

function isValidEventName(value: unknown): value is EventName {
  return EventName.includes(value as EventName);
}

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
logger.info("User service outbox worker up and running!");

const PENDING_FETCH_LIMIT = 20;

setInterval(async () => {
  // fetch PENDING events
  const rows = await db
    .select()
    .from(outboxEventsTable)
    .where(eq(outboxEventsTable.status, "PENDING"))
    .limit(PENDING_FETCH_LIMIT);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;
    const { id, event_name, payload, status, created_at, processed_at } = row;

    // verify name is valid
    if (!isValidEventName(event_name)) {
      logger.error(`Unknown event ${event_name}. Not publishing.`, {
        payload,
        eventId: id,
      });

      await db
        .update(outboxEventsTable)
        .set({ status: "PROCESSED", processed_at: new Date() })
        .where(eq(outboxEventsTable.id, id));

      continue;
    }

    // verify payload is valid using EventMap from common package
    const schema = EventSchemas[event_name];
    const result = schema.safeParse(payload);
    if (!result.success) {
      logger.error(`Invalid payload for ${event_name}.`, {
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

    const parsedPayload = result.data;
    // log event
    logger.info(`Processing ${event_name}.`, { eventId: id });

    // create AppEvent
    const event = CreateEvent(event_name, parsedPayload, "user-service");

    // publish to rabbitmq
    const routingKey = event.eventName;
    const stringifiedEvent = JSON.stringify(event);
    const message = Buffer.from(stringifiedEvent);

    logger.info(`Publishing ${routingKey}`, {
      payload: event,
      eventId: id,
    });

    channel.publish(EXCHANGE_NAME, routingKey, message, {
      persistent: true,
    });

    // mark processed in db
    await db
      .update(outboxEventsTable)
      .set({ status: "PROCESSED", processed_at: new Date() })
      .where(eq(outboxEventsTable.id, id))
      .returning();

    logger.info(`Processed ${event_name} event sucessfully`, { eventId: id });
  }
}, 5000);
