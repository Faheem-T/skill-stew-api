import { app } from "./app";
import amqp from "amqplib";
import { setupEventHandlers } from "./consumers";
import { cohortService } from "./di/container";
import { connectDB } from "./infrastructure/config/mongoConnection";
import { RabbitMQEventConsumer } from "./infrastructure/adapters/RabbitMQEventConsumer";
import { ENV } from "./utils/dotenv";
import { logger } from "./utils/logger";

process.on("uncaughtException", (err, origin) => {
  logger.error(
    "Critical application error. Exiting process with status code 1.",
    { err, origin },
  );
  process.exit(1);
});

try {
  await connectDB();
  const EXCHANGE_NAME = "stew_exchange";
  const QUEUE_NAME = "skill_payments_queue";
  const connection = await amqp.connect(ENV.RABBIT_MQ_CONNECTION_STRING);
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });
  const queue = await channel.assertQueue(QUEUE_NAME, { durable: true });
  const eventConsumer = new RabbitMQEventConsumer(
    channel,
    queue.queue,
    EXCHANGE_NAME,
    logger,
  );
  await setupEventHandlers(eventConsumer, cohortService, logger);
  app.listen(ENV.PORT);
  logger.info(`Listening on port ${ENV.PORT}`);
} catch (err) {
  logger.error(err);
  throw err;
}
