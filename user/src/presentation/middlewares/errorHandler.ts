import { NextFunction, Request, Response } from "express";
import { logger } from "../logger";
import { DomainError } from "../../domain/errors/DomainError.abstract";
import { AppError } from "../../application/errors/AppError.abstract";
import { ErrorCodeToStatusCodeMap } from "../errors/ErrorCodeToStatusCodeMap";
import { HttpStatus } from "@skillstew/common";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response<{
    success: false;
    errors: { message: string; field?: string }[];
  }>,
  _next: NextFunction,
) => {
  logger.error(err);
  if (err instanceof DomainError || err instanceof AppError) {
    res
      .status(ErrorCodeToStatusCodeMap[err.statusCode])
      .json({ success: false, ...err.toJSON() });
  } else {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, errors: [{ message: "Something went wrong." }] });
  }
};
