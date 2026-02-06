import { AppErrorCodes } from "../AppErrorCodes";
import { InfraError } from "./InfraError";

export class DbUniqueConstraintError extends InfraError {
  constructor(
    public readonly field?: string,
    cause?: Error,
  ) {
    super(
      AppErrorCodes.DB_UNIQUE_CONSTRAINT,
      "Unique constraint violation",
      cause,
    );
  }

  toJSON() {
    return {
      errors: [{ message: "This value must be unique", field: this.field }],
    };
  }
}
