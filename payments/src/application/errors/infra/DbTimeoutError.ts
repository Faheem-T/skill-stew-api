import { InfraError } from "./InfraError";
import { AppErrorCodes } from "../AppErrorCodes";

export class DbTimeoutError extends InfraError {
  constructor(cause?: Error) {
    super(AppErrorCodes.DB_TIMEOUT, "Database operation timed out", cause);
  }
}