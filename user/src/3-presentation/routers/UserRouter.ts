import { Router } from "express";
import { requireRole } from "../middlewares/requireRole";
import { authMiddleware, userController } from "../../di";

const router = Router();

// api/v1/users
router.get(
  "/",
  // authMiddleware.verify,
  requireRole("ADMIN"),
  userController.getAllUsers,
);

router.patch(
  "/:id/block",
  authMiddleware.verify,
  requireRole("ADMIN"),
  userController.blockUser,
);
router.patch(
  "/:id/unblock",
  authMiddleware.verify,
  requireRole("ADMIN"),
  userController.unblockUser,
);

export default router;
