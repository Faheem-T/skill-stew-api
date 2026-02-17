import { Router } from "express";
import { connectionController } from "../../di";

// api/v1/connections
const router = Router().post(
  "/:userId",
  connectionController.sendConnectionRequest,
);

export default router;
