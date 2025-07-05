import { NextFunction, Request, Response } from "express";
import {
  ApplicationError,
  DomainError,
  InfrastructureError,
  PresentationError,
} from "../../core/errors/AppError";
import { PresentationErrorCodes } from "../errors/PresentationErrorCodes";
import { ZodError } from "zod";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.log(err);
  if (err instanceof DomainError) {
    res.status(400).json({ error: "validation_error", message: err.message });
  } else if (err instanceof ApplicationError) {
  } else if (err instanceof InfrastructureError) {
    res.status(500).json({
      error: "SERVER_ERROR",
      message: PresentationErrorCodes.SERVER_ERROR,
    });
  } else if (err instanceof PresentationError) {
  } else if (err instanceof ZodError) {
    res.json({ error: "validation_error", errors: err.format() });
  } else {
    res.json({
      success: false,
      error: "Something went wrong",
    });
  }
};
