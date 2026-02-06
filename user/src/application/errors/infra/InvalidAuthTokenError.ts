import { AppErrorCodes } from "../AppErrorCodes";
import { InfraError } from "./InfraError";

export class InvalidAuthTokenError extends InfraError {
  constructor(cause?: Error) {
    super(
      AppErrorCodes.INVALID_AUTH_TOKEN,
      "Invalid authentication token",
      cause,
    );
  }

  toJSON() {
    return {
      errors: [{ message: "Invalid or expired authentication token" }],
    };
  }
}
