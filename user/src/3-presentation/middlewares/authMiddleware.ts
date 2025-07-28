import { RequestHandler } from "express";
import { UnauthenticatedError } from "../errors/UnauthenticatedError";
import { IJwtService } from "../../1-application/ports/IJwtService";
import { AccessTokenVerifyError, InvalidTokenError } from "@skillstew/common";
import { HttpStatus } from "@skillstew/common";

export class AuthMiddleware {
  constructor(private _jwtService: IJwtService) {}

  verify: RequestHandler = (req, res, next) => {
    try {
      const token = req.headers["authorization"]?.split(" ")[1];
      console.log(token);
      if (!token) {
        throw new UnauthenticatedError();
      }
      const payload = this._jwtService.verifyAccessToken(token);
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
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: err.message, code: err.code });
        return;
      } else if (err instanceof InvalidTokenError) {
        res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ success: false, message: err.message, code: err.code });
        return;
      }
      next(err);
    }
  };
}
