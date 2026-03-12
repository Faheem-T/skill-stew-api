import { Router } from "express";
import { expertController } from "../../di";

const router = Router();

// api/v1/experts

router.post("/apply", expertController.apply);

export default router;
