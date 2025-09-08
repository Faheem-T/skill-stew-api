import { NextFunction, Request, Response } from "express";
import { HttpStatus } from "@skillstew/common";
import { HttpMessages } from "../../constants/HTTPMessages";
import { UserRoles } from "../../types/UserRoles";

export const requireRole = (...roles: UserRoles[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (
      !req.headers["x-user-role"] ||
      !roles.includes(req.headers["x-user-role"] as any)
    ) {
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ success: false, message: HttpMessages.FORBIDDEN });
      return;
    } else {
      next();
    }
  };
};
