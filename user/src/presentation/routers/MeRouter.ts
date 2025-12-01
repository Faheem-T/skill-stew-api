import { Router } from "express";
import { requireRole } from "../middlewares/requireRole";
import { currentUserProfileController, userController } from "../../di";

// api/v1/me
const router = Router();

router.get(
  "/",
  requireRole("USER", "EXPERT", "ADMIN"),
  currentUserProfileController.getCurrentUserProfile,
);

export default router;
