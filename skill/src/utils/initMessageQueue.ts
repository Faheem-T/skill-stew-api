import amqp from "amqplib";
import { messageProducer } from "../di/container";
import { ENV } from "./dotenv";
import { logger } from "./logger";

export async function initializeMessageQueue() {
  const connection = await amqp.connect(
    `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@my-rabbit`,
  );
  const channel = await connection.createChannel();

  await messageProducer.init(channel, "stew_exchange");
  // await consumer.init(channel, "stew_exchange", "user", INTERESTED_EVENTS);

  logger.info("Producer and Consumer setup complete.");
}
