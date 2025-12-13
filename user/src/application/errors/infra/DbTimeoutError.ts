import { AppErrorCodes } from "../AppErrorCodes";
import { TransientInfraError } from "./TransientInfraError";

export class DbTimeoutError extends TransientInfraError {
  constructor(cause?: Error) {
    super(AppErrorCodes.DB_TIMEOUT, "Database timeout", cause);
  }

  toJSON() {
    return {
      errors: [{ message: "Service temporarily unavailable" }],
    };
  }
}
