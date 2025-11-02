import { SkillController } from "../controllers/SkillController";
import { SkillProfileController } from "../controllers/SkillProfileController";
import { SkillProfileRepository } from "../repositories/SkillProfileRepository";
import { SkillRepository } from "../repositories/SkillRepository";
import { SkillProfileService } from "../services/SkillProfileService";
import { SkillService } from "../services/SkillService";

const skillRepo = new SkillRepository();
const skillService = new SkillService(skillRepo);
export const skillController = new SkillController(skillService);

const skillProfileRepo = new SkillProfileRepository();
const skillProfileService = new SkillProfileService(skillProfileRepo);
export const skillProfileController = new SkillProfileController(
  skillProfileService,
);
