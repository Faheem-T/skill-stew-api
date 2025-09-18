import { Consumer } from "@skillstew/common";
import amqp from "amqplib";
import { ENV } from "./utils/dotenv.js";
import { logger } from "./utils/logger/index.js";
import { Client } from "@elastic/elasticsearch";

const connection = await amqp.connect(
  `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@my-rabbit`,
);
const channel = await connection.createChannel();

const consumer = new Consumer();

await consumer.init(channel, "stew_exchange", "es_proxy", ["user.registered"]);
consumer.registerHandler("user.registered", async (event) => {
  logger.info("Handling user registered event!", event);
  return { success: true };
});

logger.info("Event consumer set up.");

logger.info("ES URL", ENV.ES_URL);
const es = new Client({ node: ENV.ES_URL });
const esInfo = await es.info();
logger.info(esInfo);
