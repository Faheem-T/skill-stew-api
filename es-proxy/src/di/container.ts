import { SkillService } from "../application/services/SkillService";
import { UserService } from "../application/services/UserService";
import { S3StorageService } from "../infrastructure/adapters/S3StorageService";
import { es } from "../infrastructure/config/esConnection";
import { SkillRepository } from "../infrastructure/database/repositories/SkillRepository";
import { UserRepository } from "../infrastructure/database/repositories/UserRepository";
import { SkillController } from "../presentation/controllers/SkillController";
import { UserController } from "../presentation/controllers/UserController";

const s3StorageService = new S3StorageService();

const userRepo = new UserRepository(es);
export const userService = new UserService(userRepo, s3StorageService);

const skillRepo = new SkillRepository(es);
export const skillService = new SkillService(skillRepo);
export const skillController = new SkillController(skillService);

export const userController = new UserController(userService);
