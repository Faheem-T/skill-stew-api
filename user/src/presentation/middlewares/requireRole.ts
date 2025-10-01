import { NextFunction, Request, Response } from "express";
import { UserRoles } from "../../domain/entities/UserRoles";
import { HttpStatus } from "../../constants/HttpStatus";
import { HttpMessages } from "../../constants/HTTPMessages";

export const requireRole = (...roles: UserRoles[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      !req.headers["x-user-role"] ||
      !roles.includes(req.headers["x-user-role"] as any)
    ) {
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ success: false, message: HttpMessages.FORBIDDEN });
    } else {
      next();
    }
  };
};
