import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";
import { createAdminSchema } from "../../application/dtos/admin/CreateAdmin.dto";
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
import { registerSchema } from "../../application/dtos/auth/Register.dto";
import { loginSchema } from "../../application/dtos/auth/Login.dto";
import { verifyUserSchema } from "../../application/dtos/auth/VerifyUser.dto";
import { sendVerificationLinkSchema } from "../../application/dtos/auth/SendVerificationLink.dto";

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
      const dto = registerSchema.parse(req.body);
      const result = await this._registerUser.exec(dto);

      if (!result.success) {
        const { userAlreadyExists } = result;
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, userAlreadyExists });
        return;
      }

      await this._sendVerificationLink.exec({ email: dto.email });

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
      const dto = verifyUserSchema.parse(req.body);
      await this._verifyUser.exec(dto);
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
      const dto = sendVerificationLinkSchema.parse(req.body);

      await this._sendVerificationLink.exec(dto);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Email has been resent" });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = loginSchema.parse(req.body);
      const tokens = await this._loginUser.exec(dto);

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
      const dto = createAdminSchema.parse(req.body);
      await this._createAdmin.exec(dto);
      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Admin has been created" });
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
