import { Router } from "express";
import { skillController } from "../di/container";

// api/v1/skills
export const skillRouter = Router()
  .get("/:id", skillController.getSkill)
  .post("/", skillController.createSkill);
