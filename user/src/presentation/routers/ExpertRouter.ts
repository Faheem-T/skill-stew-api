import { Router } from "express";
import { expertController } from "../../di";
import { requireRole } from "../middlewares/requireRole";

const router = Router();

// api/v1/experts

router.post("/apply", requireRole("USER"), expertController.apply);

export default router;
