import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super(DomainErrorCodes.INVALID_CREDENTIALS, "Invalid credentials.");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
