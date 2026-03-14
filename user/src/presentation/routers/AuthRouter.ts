import { Router } from "express";
import { authController } from "../../di";

// /api/v1/auth
const router = Router()
  .post("/register", authController.registerUser)
  .post("/verify", authController.verify)
  .post("/resend-verification-link", authController.resendVerifyLink)
  .post("/login", authController.login)
  .post("/refresh", authController.refresh)
  .post("/google-auth", authController.googleAuth)
  .post("/logout", authController.logout)
  .post("/experts/register", authController.registerExpert)
  // TODO: Remove in production
  .post("/admin/create", authController.createAdmin);

export default router;
