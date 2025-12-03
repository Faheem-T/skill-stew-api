import { Router } from "express";
import { requireRole } from "../middlewares/requireRole";
import { currentUserProfileController } from "../../di";

// api/v1/me
const router = Router();

router
  .get(
    "/",
    requireRole("USER", "EXPERT", "ADMIN"),
    currentUserProfileController.getCurrentUserProfile,
  )
  .post(
    "/upload/pre-signed",
    currentUserProfileController.generateUploadPresignedUrl,
  );

export default router;
