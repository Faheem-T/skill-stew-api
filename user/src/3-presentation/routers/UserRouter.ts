import { Router } from "express";
import { requireRole } from "../middlewares/requireRole";
import { producer, userController } from "../../di";
import { CreateEvent } from "@skillstew/common";

const router = Router();

// api/v1/users
router.get("/", requireRole("ADMIN"), userController.getAllUsers);

router.patch("/:id/block", requireRole("ADMIN"), userController.blockUser);
router.patch("/:id/unblock", requireRole("ADMIN"), userController.unblockUser);

router.post("/dummy", requireRole("ADMIN"), userController.createDummyUsers);

router.post("/emit", (req, res, next) => {
  try {
    const { id, email } = req.body;
    const event = CreateEvent("user.registered", { id, email }, "user");
    producer.publish(event);
    res.status(200).json({ message: "Event published" });
  } catch (err) {
    next(err);
  }
});

export default router;
