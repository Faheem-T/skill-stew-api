import { UserUsecases } from "../../1-application/UserUsecases";
import { Request, Response, NextFunction } from "express";
import {
  loginSchema,
  registerSchema,
  resendVerifyEmailSchema,
  verifyEmailSchema,
} from "../validators/UserValidator";
import { IHasherService } from "../../1-application/ports/IHasherService";
import { UnauthorizedError } from "../../0-domain/errors/UnauthorizedError";

type routeHandlerParams = [
  Request,
  Response<{ success: true; data?: Record<string, any>; message?: string }>,
  NextFunction,
];

export class UserController {
  constructor(private _userUsecases: UserUsecases) {}
  getAllUsers = async (...[req, res, next]: routeHandlerParams) => {
    const users = await this._userUsecases.getAllUsers();
    res.json({ success: true, data: users });
  };

  registerUser = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const { email } = registerSchema.parse(req.body);
      await this._userUsecases.registerUser(email);
      await this._userUsecases.sendVerificationLinkToEmail(email);
      res
        .status(201)
        .json({ success: true, message: "Link has been sent to email" });
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
        .json({
          success: true,
          message: "User has been verified and password has been set",
        });
    } catch (err) {
      next(err);
    }
  };

  resendVerifyLink = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const { email } = resendVerifyEmailSchema.parse(req.body);

      await this._userUsecases.sendVerificationLinkToEmail(email);
      res.status(200).json({ success: true, message: "Email has been resent" });
    } catch (err) {
      next(err);
    }
  };

  login = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const result = loginSchema.parse(req.body);
      const { refreshToken, accessToken } =
        await this._userUsecases.loginUser(result);

      res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
        })
        .json({
          success: true,
          data: {
            accessToken,
          },
        });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        throw new UnauthorizedError();
      }
      const accessToken = this._userUsecases.refresh({ refreshToken });
      res.status(200).json({ success: true, data: { accessToken } });
    } catch (err) {
      next(err);
    }
  };
}
