import { Producer } from "@skillstew/common";
import { SkillController } from "../controllers/SkillController";
import { SkillProfileController } from "../controllers/SkillProfileController";
import { SkillProfileRepository } from "../repositories/SkillProfileRepository";
import { SkillRepository } from "../repositories/SkillRepository";
import { SkillProfileService } from "../services/SkillProfileService";
import { SkillService } from "../services/SkillService";

// Message Producer
const messageProducer = new Producer();

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
