import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class NotVerifiedError extends DomainError {
  constructor() {
    super(
      DomainErrorCodes.NOT_VERIFIED_ERROR,
      "Verify your account to continue",
    );
  }
  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
