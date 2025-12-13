import { AppErrorCodes } from "./AppErrorCodes";

export abstract class AppError extends Error {
  constructor(
    public readonly code: AppErrorCodes,
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    // Preserve original stack trace if available
    if (cause?.stack && this.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
    Object.setPrototypeOf(this, AppError.prototype);
  }

  abstract toJSON(): { errors: { message: string; field?: string }[] };
}
