import { Router } from "express";
import { requireRole } from "../middlewares/requireRole";
import { userController } from "../../di";

// api/v1/me
const router = Router();

router.get(
  "/",
  requireRole("USER", "EXPERT", "ADMIN"),
  userController.getCurrentUserProfile,
);

export default router;
