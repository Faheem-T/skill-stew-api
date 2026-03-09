import { AppError } from "./AppError.abstract";
import { AppErrorCodes } from "./AppErrorCodes";

export class InternalServiceError extends AppError {
  constructor(
    public readonly service: string,
    cause?: Error,
  ) {
    super(
      AppErrorCodes.INTERNAL_SERVICE_ERROR,
      `Internal service "${service}" failed`,
      cause,
      false, // not retryable — it's a logic/data error, not transient
    );
  }

  toJSON() {
    return { errors: [{ message: "An internal error occurred" }] };
  }
}
