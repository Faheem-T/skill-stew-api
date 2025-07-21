import { ApplicationError } from "./AppError";

export class ForbiddenError extends ApplicationError {
  constructor() {
    super("Forbidden", "FORBIDDEN_ERROR");
  }
  toJSON(): object {
    return { message: this.message, code: this.code };
  }
}
