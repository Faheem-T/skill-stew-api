import { Router } from "express";
import { subscriptionPlansController } from "../../di";
import { requireRole } from "../middlewares/requireRole";

const router = Router();
// api/v1/payments/subscriptions

router.post("/", requireRole("ADMIN"), subscriptionPlansController.createPlan);
router.get("/", subscriptionPlansController.getPlans);
router.patch(
  "/:id",
  requireRole("ADMIN"),
  subscriptionPlansController.editPlan,
);
router.delete(
  "/:id",
  requireRole("ADMIN"),
  subscriptionPlansController.deletePlan,
);

export default router;
