import { Router } from "express";
import { cohortController } from "../../di/container";
import { requireRole } from "../middlewares/requireRole";

export const cohortRouter = Router()
  .get("/", requireRole("EXPERT"), cohortController.getCohorts)
  .post("/", requireRole("EXPERT"), cohortController.createCohort)
  .get("/:id", requireRole("EXPERT"), cohortController.getCohortById)
  .patch("/:id", requireRole("EXPERT"), cohortController.updateCohort)
  .delete("/:id", requireRole("EXPERT"), cohortController.deleteCohort)
  .get("/:id/members", requireRole("EXPERT"), cohortController.getCohortMembers)
  .post(
    "/:id/enrollments",
    requireRole("USER"),
    cohortController.enrollInCohort,
  );
