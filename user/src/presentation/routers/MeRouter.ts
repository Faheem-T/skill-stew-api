import { Router } from "express";
import { requireRole } from "../middlewares/requireRole";
import { currentUserProfileController, userController } from "../../di";

// api/v1/me
const router = Router();

router
  .get(
    "/",
    requireRole("USER", "EXPERT", "ADMIN"),
    currentUserProfileController.getCurrentUserProfile,
  )
  .patch(
    "/",
    requireRole("USER"),
    currentUserProfileController.userProfileUpdate,
  )
  .post(
    "/upload/pre-signed",
    currentUserProfileController.generateUploadPresignedUrl,
  )
  .patch("/username", userController.updateUsername);

export default router;
