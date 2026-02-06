import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class UnauthorizedAccessError extends DomainError {
  constructor() {
    super(DomainErrorCodes.UNAUTHORIZED_ACCESS, "You do not have permission to access this resource.");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}