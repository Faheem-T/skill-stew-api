import { RequestHandler } from "express";
import { UnauthenticatedError } from "../errors/UnauthenticatedError";
import { JwtHelper } from "../jwt-utils/JwtHelper";
import { AccessTokenVerifyError, InvalidTokenError } from "../errors/JwtErrors";
import { HttpStatus } from "../constants/HttpStatus";

export class AuthMiddleware {
  private _jwtHelper: JwtHelper;

  constructor(
    userAccessTokenSecret: string,
    expertAccessTokenSecret: string,
    adminAccessTokenSecret: string,
  ) {
    this._jwtHelper = new JwtHelper({
      userAccessTokenSecret,
      expertAccessTokenSecret,
      adminAccessTokenSecret,
    });
  }

  verify: RequestHandler = (req, res, next) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) {
        throw new UnauthenticatedError();
      }

      const payload = this._jwtHelper.verifyAccessToken(token);
      req.user = {
        id: payload.userId,
        ...(payload.role === "ADMIN"
          ? { userame: payload.username }
          : { email: payload.email }),
        role: payload.role,
      };
      next();
    } catch (err) {
      if (err instanceof AccessTokenVerifyError) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: err.message, code: err.code });
        return;
      } else if (err instanceof InvalidTokenError) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: err.message, code: err.code });
        return;
      } else if (err instanceof UnauthenticatedError) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: err.message, code: err.code });
        return;
      }
      next(err);
    }
  };
}
