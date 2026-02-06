import { AppErrorCodes } from "../AppErrorCodes";
import { InfraError } from "./InfraError";

export class TransientInfraError extends InfraError {
  constructor(code: AppErrorCodes, message: string, cause?: Error) {
    super(code, message, cause); // TransientInfraError sets retryable to true
  }

  override toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}

