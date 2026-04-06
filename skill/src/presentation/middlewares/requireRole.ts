import type { NextFunction, Request, Response } from "express";
import { HttpStatus } from "../../constants/HttpStatusCodes";

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers["x-user-id"];
    const userRole = req.headers["x-user-role"];

    if (!userId || typeof userId !== "string" || !userRole) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        errors: [{ message: "You are not authenticated" }],
      });
      return;
    }

    if (typeof userRole !== "string" || !roles.includes(userRole)) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        errors: [{ message: "You do not have permission to access this resource." }],
      });
      return;
    }

    next();
  };
};
