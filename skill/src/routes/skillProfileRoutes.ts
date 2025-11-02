import { Router } from "express";
import { skillProfileController } from "../di/container";

export const skillProfileRouter = Router().put(
  "/",
  skillProfileController.updateProfile,
);
