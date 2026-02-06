import { DbConnectionError } from "../../application/errors/infra/DbConnectionError";

import { AppError } from "../../application/errors/AppError.abstract";
import { DbQueryError } from "../../application/errors/infra/DbQueryError";
import { DbUniqueConstraintError } from "../../application/errors/infra/DbUniqueConstraintError";
import { DbForeignKeyConstraintError } from "../../application/errors/infra/DbForeignKeyConstraintError";
import { DbTimeoutError } from "../../application/errors/infra/DbTimeoutError";

/**
 * Maps any Drizzle / Postgres error to a clean AppError
 */
export function mapDrizzleError(err: unknown): AppError {
  // Drizzle usually wraps pg errors, but the original error is still there
  const pgError = extractPostgresError(err);

  if (!pgError) {
    // Not a Postgres error at all
    return new DbQueryError(err as Error);
  }

  const code = pgError.code;

  // ---- Permanent infra errors ----

  // Unique constraint violation
  if (code === "23505") {
    const field = extractConstraintField(pgError);
    return new DbUniqueConstraintError(field, pgError);
  }

  // Foreign key constraint violation
  if (code === "23503") {
    return new DbForeignKeyConstraintError(pgError);
  }

  // ---- Transient infra errors ----

  // Deadlock detected
  if (code === "40P01") {
    return new DbTimeoutError(pgError);
  }

  // Query timeout / cancellation
  if (code === "57014") {
    return new DbTimeoutError(pgError);
  }

  // Connection-related failures
  if (isConnectionErrorCode(code)) {
    return new DbConnectionError(pgError);
  }

  // ---- Fallback ----
  return new DbQueryError(pgError);
}

function extractPostgresError(err: unknown): any | null {
  if (!err || typeof err !== "object") return null;

  // pg error shape
  if ("code" in err && typeof (err as any).code === "string") {
    return err;
  }

  // drizzle sometimes wraps the original error
  const cause = (err as any).cause;
  if (cause && typeof cause === "object" && "code" in cause) {
    return cause;
  }

  return null;
}

function isConnectionErrorCode(code: string): boolean {
  // SQLSTATE class 08 = connection exception
  return code.startsWith("08");
}

function extractConstraintField(pgError: any): string | undefined {
  // Sometimes available as `constraint`
  if (typeof pgError.constraint === "string") {
    return pgError.constraint;
  }

  // Sometimes embedded in detail text
  // Example: Key (email)=(test@test.com) already exists.
  if (typeof pgError.detail === "string") {
    const match = pgError.detail.match(/\(([^)]+)\)=/);
    if (match) return match[1];
  }

  return undefined;
}
