import { NextFunction, Request, Response } from "express";
import { UserRoles } from "../../0-domain/entities/UserRoles";
import { ForbiddenError } from "../errors/ForbiddenError";

export const requireRole = (...roles: UserRoles[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user || !roles.includes(req.user)) {
        throw new ForbiddenError();
      } else {
        next();
      }
    } catch (err) {
      next(err);
    }
  };
};
