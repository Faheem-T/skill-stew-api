import { Router } from "express";
import { connectionController } from "../../di";

// api/v1/connections
const router = Router()
  .post("/:userId", connectionController.sendConnectionRequest)
  .patch("/:connectionId/accept", connectionController.acceptConnectionRequest)
  .patch("/:connectionId/reject", connectionController.rejectConnectionRequest)
  .get("/statuses", connectionController.getConnectionStatuses)
  .get("/status/:targetId", connectionController.getConnectionStatusToUser);

export default router;
