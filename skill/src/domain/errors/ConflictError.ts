import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(DomainErrorCodes.ALREADY_EXISTS, message);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
