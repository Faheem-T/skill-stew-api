import { Router } from "express";
import { requireRole } from "../middlewares/requireRole";
import { onboardingController, userController } from "../../di";

// api/v1/users
const router = Router()
  .get("/", requireRole("ADMIN"), userController.getAllUsers)
  .patch(
    "/:id/block-status",
    requireRole("ADMIN"),
    userController.updateUserBlockStatus,
  )
  .patch(
    "/onboarding/profile",
    requireRole("USER"),
    onboardingController.onboardingUserProfileUpdate,
  );

router.get("/username-availability", userController.usernameAvailabilityCheck);

export default router;
