import { UserService } from "../application/services/UserService";
import { es } from "../infrastructure/config/esConnection";
import { UserRepository } from "../infrastructure/database/repositories/UserRepository";

const userRepo = new UserRepository(es);
export const userService = new UserService(userRepo);
