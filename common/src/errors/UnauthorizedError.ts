import { DomainError } from "./AppError";

export class UnauthorizedError extends DomainError {
  constructor() {
    super("You are not authorized", "UNAUTHORIZED");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
