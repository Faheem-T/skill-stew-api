import { AuthUsecases } from "../../1-application/AuthUsecases";
import { Request, Response, NextFunction } from "express";
import {
  loginSchema,
  registerSchema,
  resendVerifyEmailSchema,
  verifyEmailSchema,
} from "../validators/UserValidator";
import { IHasherService } from "../../1-application/ports/IHasherService";
import { UnauthorizedError } from "../../0-domain/errors/UnauthorizedError";
import {
  adminLoginSchema,
  createAdminSchema,
} from "../validators/AdminValidator";
import { HttpStatus } from "../../constants/HttpStatus";

type routeHandlerParams = [
  Request,
  Response<{ success: true; data?: Record<string, any>; message?: string }>,
  NextFunction,
];

export class AuthController {
  constructor(private _authUsecases: AuthUsecases) {}

  registerUser = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const { email } = registerSchema.parse(req.body);
      await this._authUsecases.registerUser(email);
      await this._authUsecases.sendVerificationLinkToEmail(email);
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
      await this._authUsecases.verifyUserAndSetPassword(result);
      res.status(200).json({
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

      await this._authUsecases.sendVerificationLinkToEmail(email);
      res.status(200).json({ success: true, message: "Email has been resent" });
    } catch (err) {
      next(err);
    }
  };

  login = async (...[req, res, next]: routeHandlerParams) => {
    try {
      const result = loginSchema.parse(req.body);
      const { refreshToken, accessToken } =
        await this._authUsecases.loginUser(result);

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
      const accessToken = this._authUsecases.refresh({ refreshToken });
      res.status(200).json({ success: true, data: { accessToken } });
    } catch (err) {
      next(err);
    }
  };

  createAdmin = async (
    req: Request,
    res: Response<{
      success: true;
      data?: Record<string, any>;
      message?: string;
    }>,
    next: NextFunction,
  ) => {
    try {
      const adminInfo = createAdminSchema.parse(req.body);
      this._authUsecases.createAdmin(adminInfo);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Admin has been created" });
    } catch (err) {
      next(err);
    }
  };

  adminLogin = async (
    req: Request,
    res: Response<{
      success: true;
      data?: Record<string, any>;
      message?: string;
    }>,
    next: NextFunction,
  ) => {
    try {
      const details = adminLoginSchema.parse(req.body);
      const { refreshToken, accessToken } =
        await this._authUsecases.loginAdmin(details);
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
}
