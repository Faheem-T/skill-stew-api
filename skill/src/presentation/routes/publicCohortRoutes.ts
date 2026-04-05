import { Router } from "express";
import { cohortController } from "../../di/container";

export const publicCohortRouter = Router().get(
  "/:id",
  cohortController.getPublicCohortById,
);
