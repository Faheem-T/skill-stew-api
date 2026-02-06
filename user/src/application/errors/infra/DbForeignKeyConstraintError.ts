import { AppErrorCodes } from "../AppErrorCodes";
import { InfraError } from "./InfraError";

export class DbForeignKeyConstraintError extends InfraError {
  constructor(cause?: Error) {
    super(
      AppErrorCodes.DB_FOREIGN_KEY_CONSTRAINT,
      "Foreign key constraint violation",
      cause,
    );
  }

  toJSON() {
    return {
      errors: [{ message: "Invalid reference" }],
    };
  }
}
