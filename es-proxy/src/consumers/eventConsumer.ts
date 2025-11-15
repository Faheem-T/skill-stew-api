import amqp from "amqplib";
import { ENV } from "../utils/dotenv";
import { logger } from "../utils/logger";
import { Consumer } from "@skillstew/common";
import { skillService, userService } from "../di/container";

export async function startConsumer() {
  const connection = await amqp.connect(
    `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@my-rabbit`,
  );
  const channel = await connection.createChannel();

  const consumer = new Consumer();

  await consumer.init(channel, "stew_exchange", "es_proxy", [
    "user.registered",
    "user.verified",
    "user.profileUpdated",
    "skill.profileUpdated",
    "skill.created",
    "skill.updated",
    "skill.deleted",
  ]);
  logger.info("Event consumer set up.");

  consumer.registerHandler("user.registered", async (event) => {
    logger.info(`Handling ${event.eventName}`);
    const { id } = event.data;
    await userService.create({ id });
    return { success: true };
  });

  consumer.registerHandler("user.verified", async (event) => {
    logger.info(`Handling ${event.eventName}`);
    const { id } = event.data;

    try {
      await userService.verifyUser(id);
    } catch (err) {
      logger.error(err);
      return { success: false, retryable: true };
    }

    return { success: true };
  });

  consumer.registerHandler("user.profileUpdated", async (event) => {
    logger.info(`Handling ${event.eventName}`);
    await userService.updateUserProfile(event.data);
    return { success: true };
  });

  consumer.registerHandler("skill.profileUpdated", async (event) => {
    logger.info(`Handling ${event.eventName}`);
    const { userId, offered, wanted } = event.data;

    await userService.updateUserSkillProfile({
      id: userId,
      offeredSkills: offered,
      wantedSkills: wanted,
    });

    return { success: true };
  });

  consumer.registerHandler("skill.created", async (event) => {
    logger.info(`Handling ${event.eventName}`);
    await skillService.create(event.data);
    return { success: true };
  });
  consumer.registerHandler("skill.updated", async (event) => {
    logger.info(`Handling ${event.eventName}`);
    await skillService.update(event.data);
    return { success: true };
  });
  consumer.registerHandler("skill.deleted", async (event) => {
    logger.info(`Handling ${event.eventName}`);
    await skillService.delete(event.data.id);
    return { success: true };
  });
}
