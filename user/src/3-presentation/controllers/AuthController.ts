import { Request, Response, NextFunction } from "express";
import {
  loginSchema,
  registerSchema,
  resendVerifyEmailSchema,
  verifyEmailSchema,
} from "../validators/UserValidator";
import { UnauthorizedError } from "../../0-domain/errors/UnauthorizedError";
import {
  adminLoginSchema,
  createAdminSchema,
} from "../validators/AdminValidator";
import { HttpStatus, UserRoles } from "@skillstew/common";
import { DomainValidationError } from "../../0-domain/errors/DomainValidationError";
import { ENV } from "../../utils/dotenv";
import { GoogleAuthError } from "../../1-application/errors/GoogleAuthErrors";
import { IAuthUsecases } from "../../1-application/interfaces/IAuthUsecases";

export class AuthController {
  constructor(private _authUsecases: IAuthUsecases) {}

  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = registerSchema.parse(req.body);
      const result = await this._authUsecases.registerUser(email);

      if (!result.success) {
        const { userAlreadyExists, userVerified } = result;
        res
          .status(400)
          .json({ success: false, userAlreadyExists, userVerified });
        return;
      }

      await this._authUsecases.sendVerificationLinkToEmail(email);
      res
        .status(201)
        .json({ success: true, message: "Link has been sent to email" });
    } catch (err) {
      next(err);
    }
  };

  setPasswordAndVerify = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = verifyEmailSchema.parse(req.body);
      await this._authUsecases.verifyUserAndSetPassword(result);
      res.status(200).json({
        success: true,
        message: "User has been verified and password has been set",
      });
    } catch (err) {
      if (err instanceof DomainValidationError) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: err.message });
        return;
      }
      next(err);
    }
  };

  resendVerifyLink = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email } = resendVerifyEmailSchema.parse(req.body);

      await this._authUsecases.sendVerificationLinkToEmail(email);
      res.status(200).json({ success: true, message: "Email has been resent" });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = loginSchema.parse(req.body);
      const tokens = await this._authUsecases.loginUser(result);

      if (!tokens) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "User not found" });
        return;
      }

      const { refreshToken, accessToken } = tokens;

      res
        .status(200)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          sameSite: "none",
        })
        .json({
          success: true,
          data: {
            accessToken,
          },
        });
    } catch (err) {
      if (err instanceof GoogleAuthError) {
        const status =
          err.code === "LOCAL_ACCOUNT_EXISTS"
            ? HttpStatus.CONFLICT
            : HttpStatus.BAD_REQUEST;
        res
          .status(status)
          .json({ success: false, message: err.message, error: err.code });
        return;
      }
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
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
      await this._authUsecases.createAdmin(adminInfo);
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
      success: boolean;
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
        .status(HttpStatus.OK)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          sameSite: "none",
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

  googleAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const credential = req.body.credential;

      if (!credential) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "" });
        return;
      }

      const { accessToken, refreshToken } =
        await this._authUsecases.googleAuth(credential);

      res
        .status(HttpStatus.OK)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          sameSite: "none",
        })
        .json({
          success: true,
          data: {
            accessToken,
          },
        });
    } catch (err) {
      if (err instanceof GoogleAuthError) {
        const status =
          err.code === "LOCAL_ACCOUNT_EXISTS"
            ? HttpStatus.CONFLICT
            : HttpStatus.BAD_REQUEST;
        res
          .status(status)
          .json({ success: false, message: err.message, error: err.code });
        return;
      }
      next(err);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.headers["x-user-id"] as string;
      const role = req.headers["x-user-role"] as UserRoles;
      const profile = await this._authUsecases.getProfile(userId, role);
      res.status(HttpStatus.OK).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };
}
