import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class ForbiddenError extends DomainError {
  constructor() {
    super(DomainErrorCodes.FORBIDDEN, "Forbidden.");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
