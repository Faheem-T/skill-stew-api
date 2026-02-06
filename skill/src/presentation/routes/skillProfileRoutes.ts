import { Router } from "express";
import { skillProfileController } from "../../di/container";

// /api/v1/skills/profile
export const skillProfileRouter = Router()
  .put("/", skillProfileController.updateProfile)
  .get("/me", skillProfileController.getCurrentUserProfile);
