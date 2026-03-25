import { Router } from "express";
import { expertController } from "../../di";
import { requireRole } from "../middlewares/requireRole";

// api/v1/expert-applications
const router = Router()
  .get("/", requireRole("ADMIN"), expertController.getApplications)
  .get("/:id", requireRole("ADMIN"), expertController.getApplicationDetails)
  .patch(
    "/:applicationId/approve",
    requireRole("ADMIN"),
    expertController.approveApplication,
  )
  .patch(
    "/:applicationId/reject",
    requireRole("ADMIN"),
    expertController.rejectApplication,
  )
  .post("/apply", requireRole("EXPERT_APPLICANT"), expertController.apply);

export default router;
