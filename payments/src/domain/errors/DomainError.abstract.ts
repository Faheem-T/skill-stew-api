import { DomainErrorCodes } from "./DomainErrorCodes";

export abstract class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCodes,
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    // Preserve original stack trace if available
    if (cause?.stack && this.stack) {
      this.stack = `${this.stack}\nCaused by: ${cause.stack}`;
    }
  }

  abstract toJSON(): { errors: { message: string; field?: string }[] };
}