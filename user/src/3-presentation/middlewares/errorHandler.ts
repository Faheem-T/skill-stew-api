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
import { UserAlreadyExistsError } from "../../0-domain/errors/UserAlreadyExistsError";
import { HttpStatus } from "../../constants/HttpStatus";
import { UserBlockedError } from "../../0-domain/errors/UserBlockedError";

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
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: err.code,
        message: err.message,
      });
      return;
    }
    if (err instanceof UserAlreadyExistsError) {
      res.status(HttpStatus.CONFLICT).json({
        success: false,
        error: err.code,
        message: err.message,
      });
      return;
    }
    if (err instanceof UserBlockedError) {
      res
        .status(HttpStatus.FORBIDDEN)
        .json({ success: false, error: err.code, message: err.message });
      return;
    }
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: "validation_error",
      message: err.message,
    });
    // } else if (err instanceof ApplicationError) {
  } else if (err instanceof InfrastructureError) {
    if (err instanceof EmailVerificationJwtVerifyError) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: err.name,
        message: "Token has expired",
      });
      return;
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "SERVER_ERROR",
      message: PresentationErrorCodes.SERVER_ERROR,
    });
  } else if (err instanceof PresentationError) {
    res.status(err.statusCode).json({ success: false, ...err.toJSON() });
  } else if (err instanceof ZodError) {
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
