import { Router } from "express";
import { authController } from "../../di";

const router = Router();

// /api/v1/auth
router.post("/register", authController.registerUser);
router.post("/set-password", authController.setPasswordAndVerify);
router.post("/resend-verification-link", authController.resendVerifyLink);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/google-auth", authController.googleAuth);

// admin auth routes
router.post("/admin/create", authController.createAdmin);
router.post("/admin/login", authController.adminLogin);

export default router;
