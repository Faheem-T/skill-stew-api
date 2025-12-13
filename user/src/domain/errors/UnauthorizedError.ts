import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class UnauthorizedError extends DomainError {
  constructor() {
    super(
      DomainErrorCodes.UNAUTHORIZED,
      "You do not have permission to perform this action.",
    );
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
