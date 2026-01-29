import mongoose from "mongoose";
import { ENV } from "../../utils/dotenv";
import { readFile } from "fs/promises";
import { logger } from "../../utils/logger";
import { SkillModel } from "../models/skillModel";
import { CreateEvent } from "@skillstew/common";
import { MessageProducer } from "../adapters/MessageProducer";
import amqp from "amqplib";
import type { Skill } from "../../domain/entities/Skill";
import { mapMongooseError } from "../mappers/ErrorMapper";

const RETRY_ATTEMPTS = 3;
const INITIAL_BACKOFF_MS = 3000;

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function seedData() {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      await mongoose.connect(ENV.DATABASE_URL);
      await mongoose.connection.db?.admin().command({ ping: 1 });
      logger.info("Pinged deployment. Successfully connected to MongoDB!");

      const count = await SkillModel.countDocuments();
      if (count > 0) {
        logger.info("Seeding has be done before... skipping.");
        return;
      }
      break;
    } catch (err) {
      lastError = err;
      if (attempt < RETRY_ATTEMPTS) {
        const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1);
        logger.warn(
          `MongoDB connection attempt ${attempt}/${RETRY_ATTEMPTS} failed. Retrying in ${backoffMs}ms...`,
        );
        await delay(backoffMs);
      } else {
        logger.error(
          `MongoDB connection failed after ${RETRY_ATTEMPTS} attempts.`,
        );
        err = mapMongooseError(err);
        logger.error("Couldn't connect to mongodb", err);
        throw err;
      }
    }
  }

  const rawData = await readFile(`${import.meta.dir}/skillSeedData.json`, {
    encoding: "utf8",
  });
  const data: Skill[] = JSON.parse(rawData);
  await SkillModel.insertMany(data);

  const EXCHANGE_NAME = "stew_exchange";
  const connection = await amqp.connect(ENV.RABBIT_MQ_CONNECTION_STRING);
  const channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", {
    durable: true,
  });

  const messageProducer = new MessageProducer(channel, EXCHANGE_NAME);
  data.forEach((skill) => {
    logger.info(`Publishing event for ${skill.name}`);
    messageProducer.publish(
      CreateEvent("skill.created", { ...skill }, "skill"),
    );
  });
  await channel.close();
  logger.info("Seeding complete.");
}

seedData();
