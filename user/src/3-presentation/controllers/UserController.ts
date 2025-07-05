import { UserUsecases } from "../../1-application/UserUsecases";
import { Request, Response, NextFunction } from "express";

type routeHandlerParams = [Request, Response, NextFunction];

export class UserController {
  constructor(private userUsecases: UserUsecases) {}
  getAllUsers = async (...[req, res, next]: routeHandlerParams) => {
    const users = await this.userUsecases.getAllUsers();
    res.json({ data: users });
  };
  registerUser = async (...[req, res, next]: routeHandlerParams) => {
    if (!req.body.email) {
      res.status(400).json({ error: "invalid params" });
      return;
    }
    const email = req.body.email;
    try {
      await this.userUsecases.registerUser(email);
      res.status(201).json({ message: "User created" });
    } catch (err) {
      next(err);
    }
  };
}
