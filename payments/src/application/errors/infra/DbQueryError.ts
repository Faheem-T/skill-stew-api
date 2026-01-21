import { InfraError } from "./InfraError";
import { AppErrorCodes } from "../AppErrorCodes";

export class DbQueryError extends InfraError {
  constructor(message: string = "Database query failed", cause?: Error) {
    super(AppErrorCodes.DB_QUERY_ERROR, message, cause);
  }
}