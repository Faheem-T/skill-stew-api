import { RequestHandler } from "express";
import { UnauthenticatedError } from "../errors/UnauthenticatedError";
import { IJwtService } from "../../1-application/ports/IJwtService";

export class AuthMiddleware {
  constructor(private _jwtService: IJwtService) {}

  verify: RequestHandler = (req, _res, next) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      if (!token) {
        throw new UnauthenticatedError();
      }
      const payload = this._jwtService.verifyAccessToken(token);
      req.user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      };
    } catch (err) {
      next(err);
    }
  };
}
