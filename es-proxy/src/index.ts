import { Consumer } from "@skillstew/common";
import amqp from "amqplib";
import { ENV } from "./utils/dotenv.js";
import { logger } from "./utils/logger/index";
import { Client } from "@elastic/elasticsearch";
import { ESClient } from "./ESClient.js";

start();
async function start() {
  const connection = await amqp.connect(
    `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@my-rabbit`,
  );
  const channel = await connection.createChannel();

  const consumer = new Consumer();

  await consumer.init(channel, "stew_exchange", "es_proxy", [
    "user.registered",
    "user.verified",
  ]);
  logger.info("Event consumer set up.");

  const es = new Client({ node: ENV.ES_URL });
  const esClient = new ESClient(es);
  await esClient.init();
  logger.info("ES client set up.");

  consumer.registerHandler("user.registered", async (event) => {
    const { email, id } = event.data;
    await esClient.index("users", { email, id }, id);
    return { success: true };
  });

  consumer.registerHandler("user.verified", async (event) => {
    const { id } = event.data;

    await esClient.updateUser(id, { isVerified: true });

    return { success: true };
  });
}
