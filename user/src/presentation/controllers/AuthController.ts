import { Request, Response, NextFunction } from "express";
import {
  loginSchema,
  registerSchema,
  resendVerifyEmailSchema,
  verifyEmailSchema,
} from "../validators/UserValidator";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";
import { createAdminSchema } from "../validators/AdminValidator";
import { HttpStatus } from "@skillstew/common";
import { DomainValidationError } from "../../domain/errors/DomainValidationError";
import { ENV } from "../../utils/dotenv";
import { GoogleAuthError } from "../../application/errors/GoogleAuthErrors";
import { IRegisterUser } from "../../application/interfaces/auth/IRegisterUser";
import { ILoginUser } from "../../application/interfaces/auth/ILoginUser";
import { IGoogleAuth } from "../../application/interfaces/auth/IGoogleAuth";
import { ISendVerificationLink } from "../../application/interfaces/auth/ISendVerificationLink";
import { IVerifyUser } from "../../application/interfaces/auth/IVerifyUser";
import { IGenerateAccessToken } from "../../application/interfaces/auth/IGenerateAccessToken";
import { ICreateAdmin } from "../../application/interfaces/admin/ICreateAdmin";

export class AuthController {
  constructor(
    private _registerUser: IRegisterUser,
    private _loginUser: ILoginUser,
    private _googleAuth: IGoogleAuth,
    private _sendVerificationLink: ISendVerificationLink,
    private _verifyUser: IVerifyUser,
    private _generateAccessToken: IGenerateAccessToken,
    private _createAdmin: ICreateAdmin,
  ) {}

  registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = registerSchema.parse(req.body);
      const result = await this._registerUser.exec(email, password);

      if (!result.success) {
        const { userAlreadyExists } = result;
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, userAlreadyExists });
        return;
      }

      await this._sendVerificationLink.exec(email);

      const { accessToken, refreshToken } = result;

      res
        .status(HttpStatus.CREATED)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
        })
        .json({
          success: true,
          message: "User registered successfully",
          data: { accessToken },
        });
    } catch (err) {
      next(err);
    }
  };

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = verifyEmailSchema.parse(req.body);
      await this._verifyUser.exec(result.token);
      res.status(HttpStatus.OK).json({
        success: true,
        message: "User has been verified.",
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

      await this._sendVerificationLink.exec(email);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Email has been resent" });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = loginSchema.parse(req.body);
      const tokens = await this._loginUser.exec(result.email, result.password);

      if (!tokens) {
        res
          .status(HttpStatus.NOT_FOUND)
          .json({ success: false, message: "User not found" });
        return;
      }

      const { refreshToken, accessToken } = tokens;

      res
        .status(HttpStatus.OK)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
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
      const accessToken = this._generateAccessToken.exec(refreshToken);
      res.status(HttpStatus.OK).json({ success: true, data: { accessToken } });
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
      await this._createAdmin.exec(adminInfo.username, adminInfo.password);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Admin has been created" });
    } catch (err) {
      next(err);
    }
  };

  // adminLogin = async (
  //   req: Request,
  //   res: Response<{
  //     success: boolean;
  //     data?: Record<string, any>;
  //     message?: string;
  //   }>,
  //   next: NextFunction,
  // ) => {
  //   try {
  //     const details = adminLoginSchema.parse(req.body);
  //
  //     const { refreshToken, accessToken } =
  //       await this._authUsecases.loginAdmin(details);
  //
  //     res
  //       .status(HttpStatus.OK)
  //       .cookie("refreshToken", refreshToken, {
  //         httpOnly: true,
  //         secure: ENV.NODE_ENV === "production",
  //         sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
  //       })
  //       .json({
  //         success: true,
  //         data: {
  //           accessToken,
  //         },
  //       });
  //   } catch (err) {
  //     next(err);
  //   }
  // };
  //
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
        await this._googleAuth.exec(credential);

      res
        .status(HttpStatus.OK)
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: ENV.NODE_ENV === "production",
          sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",
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

  logout = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.clearCookie("refreshToken");
      res.status(HttpStatus.OK).json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}
