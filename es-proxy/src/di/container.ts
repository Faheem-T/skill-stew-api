import { SkillService } from "../application/services/SkillService";
import { UserService } from "../application/services/UserService";
import { es } from "../infrastructure/config/esConnection";
import { SkillRepository } from "../infrastructure/database/repositories/SkillRepository";
import { UserRepository } from "../infrastructure/database/repositories/UserRepository";
import { SkillController } from "../presentation/controllers/SkillController";

const userRepo = new UserRepository(es);
export const userService = new UserService(userRepo);

const skillRepo = new SkillRepository(es);
export const skillService = new SkillService(skillRepo);
export const skillController = new SkillController(skillService);
