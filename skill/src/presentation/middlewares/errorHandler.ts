import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../utils/logger";
import { DomainError } from "../../domain/errors/DomainError.abstract";
import { AppError } from "../../application/errors/AppError.abstract";
import { ErrorCodeToStatusCodeMap } from "../errors/ErrorCodeToStatusCodeMap";
import { HttpStatus } from "../../constants/HttpStatusCodes";
import { ValidationError } from "../../application/errors/ValidationError";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response<{
    success: false;
    errors: { message: string; field?: string }[];
  }>,
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    error = mapZodErrorToValidationError(error);
  }

  const errorChain = getFullErrorChain(error);

  logger.error({
    message: "Application error occurred",
    error: {
      name: error.name,
      message: error.message,
      code:
        error instanceof DomainError || error instanceof AppError
          ? error.code
          : undefined,
      stack: error.stack,
      chain: errorChain,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.headers["x-user-id"],
      userRole: req.headers["x-user-role"],
    },
    timestamp: new Date().toISOString(),
  });

  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let userResponse: {
    success: false;
    errors: { message: string; field?: string }[];
  };

  if (error instanceof DomainError || error instanceof AppError) {
    statusCode = ErrorCodeToStatusCodeMap[error.code];
    userResponse = { ...error.toJSON(), success: false };
  } else {
    // Unknown/unexpected error
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    userResponse = {
      errors: [
        {
          message:
            process.env.NODE_ENV === "development"
              ? error.message
              : "An unexpected error occurred",
        },
      ],
      success: false,
    };
  }

  res.status(statusCode).json(userResponse);
};

// Helper to extract full error chain
function getFullErrorChain(error: Error): Array<{
  name: string;
  message: string;
  stack?: string;
}> {
  const chain = [];
  let currentError: Error | undefined = error;

  while (currentError) {
    chain.push({
      name: currentError.name,
      message: currentError.message,
      // Only include stack in development
      stack:
        process.env.NODE_ENV === "development" ? currentError.stack : undefined,
    });

    // Get the next error in the chain
    if ("cause" in currentError && currentError.cause instanceof Error) {
      currentError = currentError.cause;
    } else {
      break;
    }
  }

  return chain;
}

/**
 * Maps a Zod error to a ValidationError instance
 * @param zodError - The ZodError thrown or returned from Zod validation
 * @returns ValidationError instance
 */
export function mapZodErrorToValidationError(
  zodError: ZodError,
): ValidationError {
  const errors = zodError.issues.map((issue) => ({
    message: issue.message,
    field: issue.path.length > 0 ? issue.path.join(".") : undefined,
  }));

  return new ValidationError(errors, zodError);
}
