import { Router } from "express";
import { userController } from "../../di/container";

// /api/v1/search/users
export const userRouter = Router().get(
  "/recommended",
  userController.getRecommendedUsers,
);
