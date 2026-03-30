import { Router } from "express";
import { workshopController } from "../../di/container";
import { requireRole } from "../middlewares/requireRole";

export const workshopRouter = Router().post(
  "/",
  requireRole("EXPERT"),
  workshopController.createWorkshop,
).patch(
  "/:id",
  requireRole("EXPERT"),
  workshopController.updateWorkshop,
).post(
  "/:id/sessions",
  requireRole("EXPERT"),
  workshopController.replaceWorkshopSessions,
).patch(
  "/:id/sessions/:sessionId",
  requireRole("EXPERT"),
  workshopController.updateWorkshopSession,
).post(
  "/:id/publish",
  requireRole("EXPERT"),
  workshopController.publishWorkshop,
);
