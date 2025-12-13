import { AppErrorCodes } from "../AppErrorCodes";
import { InfraError } from "./InfraError";

export class DbQueryError extends InfraError {
  constructor(cause?: Error) {
    super(AppErrorCodes.DB_QUERY_ERROR, "Database query failed", cause);
  }

  toJSON() {
    return {
      errors: [{ message: "Internal server error" }],
    };
  }
}
