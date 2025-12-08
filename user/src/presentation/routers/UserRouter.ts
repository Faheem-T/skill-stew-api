import { Router } from "express";
import { requireRole } from "../middlewares/requireRole";
import { onboardingController, userController } from "../../di";

const router = Router();

// api/v1/users
router.get("/", requireRole("ADMIN"), userController.getAllUsers);

router.patch(
  "/:id/block-status",
  requireRole("ADMIN"),
  userController.updateUserBlockStatus,
);

// router.patch("/profile", requireRole("USER"), userController.userProfileUpdate);

router.patch(
  "/onboarding/profile",
  requireRole("USER"),
  onboardingController.onboardingUserProfileUpdate,
);

export default router;
