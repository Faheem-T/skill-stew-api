import { ApplicationError } from "./AppError";

export class UnauthenticatedError extends ApplicationError {
  constructor() {
    super("Unauthenticated", "USER_UNAUTHENTICATED");
  }
  toJSON(): object {
    return { name: this.name, message: this.message };
  }
}
