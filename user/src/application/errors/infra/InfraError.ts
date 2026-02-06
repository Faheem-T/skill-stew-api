import { AppError } from "../AppError.abstract";
import { AppErrorCodes } from "../AppErrorCodes";

export class InfraError extends AppError {
  constructor(code: AppErrorCodes, message: string, cause?: Error) {
    super(code, message, cause, false);
  }
  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
