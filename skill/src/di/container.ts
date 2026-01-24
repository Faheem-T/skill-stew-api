import { SkillProfileService } from "../application/services/SkillProfileService";
import { SkillService } from "../application/services/SkillService";
import { MessageProducer } from "../infrastructure/adapters/MessageProducer";
import { SkillProfileRepository } from "../infrastructure/repositories/SkillProfileRepository";
import { SkillRepository } from "../infrastructure/repositories/SkillRepository";
import { SkillController } from "../presentation/controllers/SkillController";
import { SkillProfileController } from "../presentation/controllers/SkillProfileController";
import { ENV } from "../utils/dotenv";
import amqp from "amqplib";

// RabbitMQ
const EXCHANGE_NAME = "stew_exchange";
const QUEUE_NAME = "user_service_queue";
const connection = await amqp.connect(
  `amqp://${ENV.RABBITMQ_USER}:${ENV.RABBITMQ_PASSWORD}@my-rabbit`,
);
const channel = await connection.createChannel();
await channel.assertExchange(EXCHANGE_NAME, "topic", {
  durable: true,
});
const queue = await channel.assertQueue(QUEUE_NAME, {
  durable: true,
});

export const messageProducer = new MessageProducer(channel, EXCHANGE_NAME);

const skillRepo = new SkillRepository();
const skillService = new SkillService(skillRepo, messageProducer);
export const skillController = new SkillController(skillService);

const skillProfileRepo = new SkillProfileRepository();
const skillProfileService = new SkillProfileService(
  skillProfileRepo,
  messageProducer,
);
export const skillProfileController = new SkillProfileController(
  skillProfileService,
);
