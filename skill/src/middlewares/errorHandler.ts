import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { ZodError } from "zod";
import { HttpStatus } from "../constants/HttpStatusCodes";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  logger.error(err);
  if (err instanceof ZodError) {
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: "validation_error",
      message: "Invalid Input",
      errors: err.issues.map((issue) => ({
        ...(issue.path.length > 0 && { field: issue.path.join(".") }),
        error: issue.message,
      })),
    });
  } else {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "unexpected_error",
      message: "Something unexpected happened",
    });
  }
};
