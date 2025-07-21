import { NextFunction, Request, Response } from "express";
import { UserRoles } from "../types/UserRoles";
import { ForbiddenError } from "../errors/ForbiddenError";

export const requireRole = (...roles: UserRoles[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        throw new ForbiddenError();
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  };
};
