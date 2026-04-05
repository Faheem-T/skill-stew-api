import { AppErrorCodes } from "../AppErrorCodes";
import { InfraError } from "./InfraError";

export class ExternalServiceError extends InfraError {
  constructor(message: string, cause?: Error) {
    super(AppErrorCodes.EXTERNAL_SERVICE_ERROR, message, cause);
  }
}
