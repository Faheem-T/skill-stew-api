import { RequestHandler } from "express";
import { AccessTokenVerifyError, InvalidTokenError } from "../errors/JwtErrors";
import { JwtService } from "../utils/JwtService";
import { HttpStatus } from "../constants/HttpStatus";
import { HttpMessages } from "../constants/HttpMessages";
import { ENV } from "../utils/dotenv";
import { isAuthRequired } from "../utils/isAuthRequired";
import { HTTPMethod } from "../types/HTTPMethod";

export const authMiddleware: RequestHandler = (req, res, next) => {
  const path = req.path;
  const method = req.method as HTTPMethod;

  const { matched, roles } = isAuthRequired(path, method);

  // auth not required
  if (!matched) {
    next();
    return;
  }

  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: HttpMessages.UNAUTHENTICATED });
      return;
    }
    const payload = jwtService.verifyAccessToken(token);
    (req as any).user = {
      id: payload.userId,
      ...(payload.role === "ADMIN"
        ? { userame: payload.username }
        : { email: payload.email }),
      role: payload.role,
    };

    if (!roles.includes(payload.role)) {
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ success: false, message: HttpMessages.FORBIDDEN });
      return;
    }

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

const jwtService = new JwtService({
  adminAccessTokenSecret: ENV.ADMIN_ACCESS_TOKEN_SECRET,
  adminRefreshTokenSecret: ENV.ADMIN_REFRESH_TOKEN_SECRET,
  expertAccessTokenSecret: ENV.EXPERT_REFRESH_TOKEN_SECRET,
  expertRefreshTokenSecret: ENV.EXPERT_REFRESH_TOKEN_SECRET,
  userAccessTokenSecret: ENV.USER_ACCESS_TOKEN_SECRET,
  userRefreshTokenSecret: ENV.USER_REFRESH_TOKEN_SECRET,
});
