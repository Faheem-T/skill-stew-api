import { Router } from "express";
import { connectionController } from "../../di";

// api/v1/connections
const router = Router()
  .post("/:userId", connectionController.sendConnectionRequest)
  .patch("/:connectionId/accept", connectionController.acceptConnectionRequest)
  .patch("/:connectionId/reject", connectionController.rejectConnectionRequest)
  .get("/status/:targetId", connectionController.getConnectionStatusToUser)
  .get("/:userId/connected-users/count", connectionController.getConnectedUsersCount)
  .get("/:userId/connected-users", connectionController.getConnectedUsers)
  .get("/:userId/connected-ids", connectionController.getAllConnectedUserIds);

export default router;
