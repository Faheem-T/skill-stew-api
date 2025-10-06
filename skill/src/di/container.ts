import { SkillController } from "../controllers/SkillController";
import { SkillRepository } from "../repositories/SkillRepository";
import { SkillService } from "../services/SkillService";

const skillRepo = new SkillRepository();
const skillService = new SkillService(skillRepo);
export const skillController = new SkillController(skillService);
