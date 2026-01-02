import mongoose from "mongoose";
import { ENV } from "../utils/dotenv";
import { readFile } from "fs/promises";
import { logger } from "../utils/logger";
import { Skill } from "../entities/Skill";
import { SkillModel } from "../models/skillModel";
import { CreateEvent } from "@skillstew/common";
import { MessageProducer } from "../adapters/MessageProducer";
import amqp from "amqplib";

async function seedData() {
  try {
    await mongoose.connect(ENV.DATABASE_URL);

    const count = await SkillModel.countDocuments();
    if (count > 0) {
      logger.info("Seeding has be done before... skipping.");
      return;
    }
  } catch (err) {
    logger.error("Couldn't connect to mongodb", err);
    throw err;
  }

  const rawData = await readFile("/app/src/config/skillSeedData.json", {
    encoding: "utf8",
  });
  const data: Skill[] = JSON.parse(rawData);
  await SkillModel.insertMany(data);

  const EXCHANGE_NAME = "stew_exchange";
  const connection = await amqp.connect(
    `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@my-rabbit`,
  );
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
