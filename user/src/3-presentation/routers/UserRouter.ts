import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserUsecases } from "../../1-application/UserUsecases";
import { UserRepository } from "../../2-infrastructure/db/UserRepository";
import { EmailService } from "../../2-infrastructure/services/EmailService";
import { JwtService } from "../../2-infrastructure/services/JwtService";
import { BcryptHasher } from "../../2-infrastructure/services/HashService";

const router = Router();

const emailService = new EmailService();
const jwtService = new JwtService();
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

export default router;
