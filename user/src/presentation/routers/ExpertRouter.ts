import { Router } from "express";
import { expertController } from "../../di";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

// api/v1/experts

router.get(
  "/applications",
  requireRole("ADMIN"),
  expertController.getApplications,
);
router.get(
  "/applications/:id",
  requireRole("ADMIN"),
  expertController.getApplicationDetails,
);
router.post("/apply", requireRole("EXPERT_APPLICANT"), expertController.apply);

export default router;
