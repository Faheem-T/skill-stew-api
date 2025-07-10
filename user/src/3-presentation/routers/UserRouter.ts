import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserUsecases } from "../../1-application/UserUsecases";
import { UserRepository } from "../../2-infrastructure/db/UserRepository";
import { EmailService } from "../../2-infrastructure/services/EmailService";
import { JwtService } from "../../2-infrastructure/services/JwtService";
import { BcryptHasher } from "../../2-infrastructure/services/HashService";
import { ENV } from "../../config/dotenv";

const router = Router();

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
const userUsecases = new UserUsecases(
  userRepo,
  emailService,
  jwtService,
  hasherService,
);
const userController = new UserController(userUsecases);

// /api/users
router.get("/", userController.getAllUsers);
router.post("/register", userController.registerUser);
router.post("/set-password", userController.setPasswordAndVerify);
router.post("/resend-verification-link", userController.resendVerifyLink);
router.post("/login", userController.login);
router.post("/refresh", userController.refresh);

export default router;
