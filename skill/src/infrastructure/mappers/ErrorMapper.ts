import type { AppError } from "../../application/errors";
import { DbConnectionError } from "../../application/errors/infra/DbConnectionError";
import { DbQueryError } from "../../application/errors/infra/DbQueryError";
import { DbTimeoutError } from "../../application/errors/infra/DbTimeoutError";
import { DbUniqueConstraintError } from "../../application/errors/infra/DbUniqueConstraintError";

/**
 * Maps any Mongoose / MongoDB error to a clean AppError
 */
export function mapMongooseError(
  err: unknown,
): DbConnectionError | DbTimeoutError | DbQueryError | DbUniqueConstraintError {
  if (!err || typeof err !== "object") {
    return new DbQueryError(err as Error);
  }

  const error = err as Error;

  // Handle specific Mongoose/MongoDB error types
  if (isMongoError(error)) {
    return mapMongoError(error);
  }

  // Handle Mongoose validation errors
  if (isMongooseValidationError(error)) {
    return mapValidationError(error);
  }

  // Handle Mongoose cast errors
  if (isMongooseCastError(error)) {
    return mapCastError(error);
  }

  // Handle generic errors
  return new DbQueryError(error);
}

function isMongoError(error: Error): boolean {
  return (
    error.name === "MongoError" ||
    error.name === "MongoServerError" ||
    error.constructor.name === "MongoError"
  );
}

function isMongooseValidationError(error: Error): boolean {
  return error.name === "ValidationError";
}

function isMongooseCastError(error: Error): boolean {
  return error.name === "CastError";
}

function mapMongoError(error: Error): AppError {
  const mongoError = error as any;

  // ---- Connection-related errors ----
  if (isConnectionError(mongoError)) {
    return new DbConnectionError(error);
  }

  // ---- Timeout errors ----
  if (isTimeoutError(mongoError)) {
    return new DbTimeoutError(error);
  }

  // ---- Duplicate key error ----
  if (isDuplicateKeyError(mongoError)) {
    const field = extractDuplicateField(mongoError);
    return new DbUniqueConstraintError(field, error);
  }

  // ---- Write conflicts ----
  if (isWriteConflictError(mongoError)) {
    return new DbTimeoutError(error);
  }

  // ---- Fallback ----
  return new DbQueryError(error);
}

function mapValidationError(error: Error): DbQueryError {
  // Mongoose validation errors are essentially query/data errors
  return new DbQueryError(error);
}

function mapCastError(error: Error): DbQueryError {
  // Mongoose cast errors are essentially query/data errors
  return new DbQueryError(error);
}

function isConnectionError(mongoError: any): boolean {
  // MongoDB connection error codes
  const connectionCodes = [
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "ECONNRESET",
    "ENETDOWN",
    "ENETUNREACH",
  ];

  // Check error code
  if (mongoError.code && connectionCodes.includes(mongoError.code)) {
    return true;
  }

  // Check error message patterns
  const message = mongoError.message || "";
  const connectionPatterns = [
    "failed to connect",
    "connection refused",
    "connection timeout",
    "connection closed",
    "network error",
  ];

  return connectionPatterns.some((pattern) =>
    message.toLowerCase().includes(pattern),
  );
}

function isTimeoutError(mongoError: any): boolean {
  const message = mongoError.message || "";
  const timeoutPatterns = [
    "timeout",
    "timed out",
    "operation timed out",
    "max time limit",
  ];

  return timeoutPatterns.some((pattern) =>
    message.toLowerCase().includes(pattern),
  );
}

function isDuplicateKeyError(mongoError: any): boolean {
  // MongoDB duplicate key error code
  return mongoError.code === 11000 || mongoError.code === 11001;
}

function isWriteConflictError(mongoError: any): boolean {
  // MongoDB write conflict error code
  return mongoError.code === 112;
}

function extractDuplicateField(mongoError: any): string | undefined {
  // Extract field name from error message
  // Example: "E11000 duplicate key error collection: test.skills index: name_1 dup key: { name: \"JavaScript\" }"
  const message = mongoError.message || "";

  // Try to extract from index pattern
  const indexMatch = message.match(/index:\s*([^_\s]+)_\d+/);
  if (indexMatch) {
    return indexMatch[1];
  }

  // Try to extract from dup key pattern
  const dupKeyMatch = message.match(/dup key:\s*{\s*([^:]+):/);
  if (dupKeyMatch) {
    return dupKeyMatch[1].trim();
  }

  return undefined;
}

