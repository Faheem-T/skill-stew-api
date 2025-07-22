import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import {
  HttpStatus,
  DomainError,
  InfrastructureError,
  UnauthorizedError,
  AccessTokenVerifyError,
  ForbiddenError,
  ApplicationError,
} from "@skillstew/common";

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
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: "validation_error",
      message: err.message,
    });
  } else if (err instanceof ApplicationError) {
    if (err instanceof ForbiddenError) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: "Forbidden",
        error: "FORBIDDEN_ERROR",
      });
      return;
    }
    res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: "Application error",
      error: "APPLICATION_ERROR",
    });
  } else if (err instanceof InfrastructureError) {
    if (err instanceof AccessTokenVerifyError) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: "AUTHORIZATION_ERROR",
        message: "Unauthorized",
      });
      return;
    }
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: "SERVER_ERROR",
      message: "Internal server error",
    });
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
