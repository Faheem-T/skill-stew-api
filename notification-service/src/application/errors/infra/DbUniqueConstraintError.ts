import { AppErrorCodes } from "../AppErrorCodes";
import { InfraError } from "./InfraError";

export class DbUniqueConstraintError extends InfraError {
  constructor(field?: string, cause?: Error) {
    super(
      AppErrorCodes.DB_UNIQUE_CONSTRAINT,
      `Duplicate entry for field: ${field || "unknown"}`,
      cause,
    );
  }

  override toJSON() {
    return {
      errors: [{ message: this.message }],
    };
  }
}

