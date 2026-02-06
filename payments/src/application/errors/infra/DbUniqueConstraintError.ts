import { InfraError } from "./InfraError";
import { AppErrorCodes } from "../AppErrorCodes";

export class DbUniqueConstraintError extends InfraError {
  constructor(field?: string, cause?: Error) {
    const message = field ? `Duplicate value for field: ${field}` : "Database unique constraint violation";
    super(AppErrorCodes.DB_UNIQUE_CONSTRAINT, message, cause);
  }
}