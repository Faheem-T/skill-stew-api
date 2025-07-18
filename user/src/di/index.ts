import { AuthController } from "../3-presentation/controllers/AuthController";
import { AuthUsecases } from "../1-application/AuthUsecases";
import { UserRepository } from "../2-infrastructure/db/UserRepository";
import { EmailService } from "../2-infrastructure/services/EmailService";
import { JwtService } from "../2-infrastructure/services/JwtService";
import { BcryptHasher } from "../2-infrastructure/services/HashService";
import { ENV } from "../config/dotenv";
import { AdminRepository } from "../2-infrastructure/db/AdminRepository";
import { UserUsecases } from "../1-application/UserUsecases";
import { UserController } from "../3-presentation/controllers/UserController";
import { AuthMiddleware } from "../3-presentation/middlewares/authMiddleware";
const emailService = new EmailService();
const jwtService = new JwtService({
  adminAccessTokenSecret: ENV.ADMIN_ACCESS_TOKEN_SECRET,
  adminRefreshTokenSecret: ENV.ADMIN_REFRESH_TOKEN_SECRET,
  expertAccessTokenSecret: ENV.EXPERT_REFRESH_TOKEN_SECRET,
  expertRefreshTokenSecret: ENV.EXPERT_REFRESH_TOKEN_SECRET,
  userAccessTokenSecret: ENV.USER_ACCESS_TOKEN_SECRET,
  userRefreshTokenSecret: ENV.USER_REFRESH_TOKEN_SECRET,
  emailJwtSecret: ENV.EMAIL_VERIFICATON_JWT_SECRET,
});
const hasherService = new BcryptHasher();
const userRepo = new UserRepository();
const adminRepo = new AdminRepository();
const authUsecases = new AuthUsecases(
  userRepo,
  emailService,
  jwtService,
  hasherService,
  adminRepo,
);
export const authController = new AuthController(authUsecases);

const userUsecases = new UserUsecases(userRepo);
export const userController = new UserController(userUsecases);

export const authMiddleware = new AuthMiddleware(jwtService);
