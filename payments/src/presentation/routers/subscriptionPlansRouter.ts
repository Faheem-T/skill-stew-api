import { Router } from "express";
import { subscriptionPlansController } from "../../di";

const router = Router();
// api/v1/payments/subscriptions

router.post("/");
router.get("/");
router.patch("/:id");
router.delete("/:id");

export default router;
