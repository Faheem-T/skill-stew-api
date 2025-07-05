import { UserUsecases } from "../../1-application/UserUsecases";
import { Request, Response, NextFunction } from "express";
import {
  loginSchema,
  registerSchema,
  resendVerifyEmailSchema,
  verifyEmailSchema,
} from "../validators/UserValidator";
import { IHasherService } from "../../1-application/ports/IHasherService";

type routeHandlerParams = [Request, Response, NextFunction];

export class UserController {
  constructor(private _userUsecases: UserUsecases) {}
  getAllUsers = async (...[req, res, next]: routeHandlerParams) => {
    const users = await this._userUsecases.getAllUsers();
    res.json({ data: users });
  };

  registerUser = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const { email } = registerSchema.parse(req.body);
      await this._userUsecases.registerUser(email);
      await this._userUsecases.sendVerificationLinkToEmail(email);
      res.status(201).json({ message: "Link has been sent to email" });
    } catch (err) {
      next(err);
    }
  };

  setPasswordAndVerify = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const result = verifyEmailSchema.parse(req.body);
      await this._userUsecases.verifyUserAndSetPassword(result);
      res
        .status(200)
        .json({ message: "User has been verified and password has been set" });
    } catch (err) {
      next(err);
    }
  };

  resendVerifyLink = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const { email } = resendVerifyEmailSchema.parse(req.body);

      await this._userUsecases.sendVerificationLinkToEmail(email);
      res.status(200).json({ message: "Email has been resent" });
    } catch (err) {
      next(err);
    }
  };

  login = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const { password, email } = loginSchema.parse(req.body);
    } catch (err) {
      next(err);
    }
  };
}
