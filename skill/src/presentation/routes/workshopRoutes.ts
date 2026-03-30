import { Router } from "express";
import { workshopController } from "../../di/container";
import { requireRole } from "../middlewares/requireRole";

export const workshopRouter = Router().post(
  "/",
  requireRole("EXPERT"),
  workshopController.createWorkshop,
);
