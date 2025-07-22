import { Router } from "express";
import { authMiddleware, subscriptionPlansController } from "../../di";
import { requireRole } from "@skillstew/common";

const router = Router();
// api/v1/payments/subscriptions

router.post(
  "/",
  authMiddleware.verify,
  requireRole("ADMIN"),
  subscriptionPlansController.createPlan,
);
router.get("/", subscriptionPlansController.getPlans);
router.patch(
  "/:id",
  authMiddleware.verify,
  requireRole("ADMIN"),
  subscriptionPlansController.editPlan,
);
router.delete("/:id", authMiddleware.verify, requireRole("ADMIN"));

export default router;
