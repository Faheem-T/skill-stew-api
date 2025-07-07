import { NextFunction, Request, Response } from "express";
import {
  ApplicationError,
  DomainError,
  InfrastructureError,
} from "../../core/errors/AppError";
import { PresentationError } from "../errors/PresentationError";
import { PresentationErrorCodes } from "../errors/PresentationErrorCodes";
import { ZodError } from "zod";
import { EmailVerificationJwtVerifyError } from "../../2-infrastructure/errors/JwtErrors";
import { UnauthorizedError } from "../../0-domain/errors/UnauthorizedError";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response<{
    success: false;
    error: string;
    message: string;
    errors?: { error: string; field?: string }[];
  }>,
  _next: NextFunction,
) => {
  console.log(err);
  if (err instanceof DomainError) {
    if (err instanceof UnauthorizedError) {
      res.status(401).json({
        success: false,
        error: err.code,
        message: err.message,
      });
    }
    res.status(400).json({
      success: false,
      error: "validation_error",
      message: err.message,
    });
  } else if (err instanceof ApplicationError) {
  } else if (err instanceof InfrastructureError) {
    if (err instanceof EmailVerificationJwtVerifyError) {
      res.status(400).json({
        success: false,
        error: err.name,
        message: "Token has expired",
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: "SERVER_ERROR",
      message: PresentationErrorCodes.SERVER_ERROR,
    });
  } else if (err instanceof PresentationError) {
    res.status(err.statusCode).json({ success: false, ...err.toJSON() });
  } else if (err instanceof ZodError) {
    res.json({
      success: false,
      error: "validation_error",
      message: "Invalid Input",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        error: issue.message,
      })),
    });
  } else {
    res.json({
      success: false,
      error: "unexpected_error",
      message: "Something unexpected happened",
    });
  }
};
