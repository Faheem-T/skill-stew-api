import { Router } from "express";
import { container } from "../../container";
import { TYPES } from "../../constants/Types";
import { NotificationController } from "../controllers/NotificationController";

const notificationController = container.get<NotificationController>(
  TYPES.NotificationController,
);

// /api/v1/notifications
const router = Router()
  .get("/", notificationController.getNotifications)
  .patch("/:id/read", notificationController.markRead);

export default router;
