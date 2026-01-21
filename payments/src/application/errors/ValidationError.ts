import { AppError } from "./AppError.abstract";
import { AppErrorCodes } from "./AppErrorCodes";

export class ValidationError extends AppError {
  public readonly errors: Array<{ message: string; field?: string }>;

  constructor(
    errors: Array<{ message: string; field?: string }>,
    error?: Error,
  ) {
    super(AppErrorCodes.VALIDATION_ERROR, "Validation Error", error, false);
    this.errors = errors;
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: this.errors };
  }
}