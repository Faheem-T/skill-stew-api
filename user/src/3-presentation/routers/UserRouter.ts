import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserUsecases } from "../../1-application/UserUsecases";
import { UserRepository } from "../../2-infrastructure/db/UserRepository";

const router = Router();

const userRepo = new UserRepository();
const userUsecases = new UserUsecases(userRepo);
const userController = new UserController(userUsecases);

// /api/users
router.get("/", userController.getAllUsers);
router.post("/register", userController.registerUser);

export default router;
