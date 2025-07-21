import { RequestHandler } from "express";
import { UnauthenticatedError } from "../errors/UnauthenticatedError";
import { JwtHelper } from "../jwt-utils/JwtHelper";

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

  verify: RequestHandler = (req, _res, next) => {
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
      next(err);
    }
  };
}
