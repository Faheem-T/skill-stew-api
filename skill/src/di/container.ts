import { CohortService } from "../application/services/CohortService";
import { SkillProfileService } from "../application/services/SkillProfileService";
import { SkillService } from "../application/services/SkillService";
import { WorkshopService } from "../application/services/WorkshopService";
import { CohortMembershipRepository } from "../infrastructure/repositories/CohortMembershipRepository";
import { CohortRepository } from "../infrastructure/repositories/CohortRepository";
import { MessageProducer } from "../infrastructure/adapters/MessageProducer";
import { UnitOfWork } from "../infrastructure/persistence/UnitOfWork";
import { OutboxEventRepository } from "../infrastructure/repositories/OutboxEventRepository";
import { SkillProfileRepository } from "../infrastructure/repositories/SkillProfileRepository";
import { SkillRepository } from "../infrastructure/repositories/SkillRepository";
import { WorkshopRepository } from "../infrastructure/repositories/WorkshopRepository";
import { S3StorageService } from "../infrastructure/services/S3StorageService";
import { CohortController } from "../presentation/controllers/CohortController";
import { SkillController } from "../presentation/controllers/SkillController";
import { SkillProfileController } from "../presentation/controllers/SkillProfileController";
import { WorkshopController } from "../presentation/controllers/WorkshopController";
import { ENV } from "../utils/dotenv";
import amqp from "amqplib";

// RabbitMQ
const EXCHANGE_NAME = "stew_exchange";
const QUEUE_NAME = "user_service_queue";
const connection = await amqp.connect(ENV.RABBIT_MQ_CONNECTION_STRING);
const channel = await connection.createChannel();
await channel.assertExchange(EXCHANGE_NAME, "topic", {
  durable: true,
});
const queue = await channel.assertQueue(QUEUE_NAME, {
  durable: true,
});

export const messageProducer = new MessageProducer(channel, EXCHANGE_NAME);
const storageService = new S3StorageService();
const unitOfWork = new UnitOfWork();
const outboxEventRepo = new OutboxEventRepository();
const cohortRepo = new CohortRepository();
const cohortMembershipRepo = new CohortMembershipRepository();

const skillRepo = new SkillRepository();
const skillService = new SkillService(skillRepo, messageProducer);
export const skillController = new SkillController(skillService);

const workshopRepo = new WorkshopRepository();
const workshopService = new WorkshopService(
  workshopRepo,
  cohortRepo,
  storageService,
  outboxEventRepo,
  unitOfWork,
);
export const workshopController = new WorkshopController(workshopService);

const cohortService = new CohortService(
  cohortRepo,
  cohortMembershipRepo,
  workshopRepo,
  storageService,
);
export const cohortController = new CohortController(cohortService);

const skillProfileRepo = new SkillProfileRepository();
const skillProfileService = new SkillProfileService(
  skillProfileRepo,
  messageProducer,
);
export const skillProfileController = new SkillProfileController(
  skillProfileService,
);
