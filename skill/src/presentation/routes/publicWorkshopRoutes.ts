import { Router } from "express";
import { publicWorkshopController } from "../../di/container";

export const publicWorkshopRouter = Router().get(
  "/:id",
  publicWorkshopController.getPublicWorkshopById,
);
