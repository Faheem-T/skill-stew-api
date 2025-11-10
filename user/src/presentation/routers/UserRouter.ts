import { Router } from "express";
import { requireRole } from "../middlewares/requireRole";
import { userController } from "../../di";

const router = Router();

// api/v1/users
router.get("/", requireRole("ADMIN"), userController.getAllUsers);

router.patch("/:id/block", requireRole("ADMIN"), userController.blockUser);
router.patch("/:id/unblock", requireRole("ADMIN"), userController.unblockUser);

router.post("/dummy", requireRole("ADMIN"), userController.createDummyUsers);

router.patch("/profile", requireRole("USER"), userController.userProfileUpdate);

export default router;
