import { AppErrorCodes } from "../AppErrorCodes";
import { TransientInfraError } from "./TransientInfraError";

export class DbConnectionError extends TransientInfraError {
  constructor(cause?: Error) {
    super(
      AppErrorCodes.DB_CONNECTION_ERROR,
      "Database connection failed",
      cause,
    );
  }

  override toJSON() {
    return {
      errors: [{ message: "Service temporarily unavailable" }],
    };
  }
}

