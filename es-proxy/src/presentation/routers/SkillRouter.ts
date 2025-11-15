import { Router } from "express";
import { skillController } from "../../di/container";

// api/v1/search/skills
export const skillRouter = Router().get("/", skillController.search);
