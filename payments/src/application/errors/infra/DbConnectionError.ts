import { InfraError } from "./InfraError";
import { AppErrorCodes } from "../AppErrorCodes";

export class DbConnectionError extends InfraError {
  constructor(cause?: Error) {
    super(AppErrorCodes.DB_CONNECTION_ERROR, "Database connection failed", cause);
  }
}