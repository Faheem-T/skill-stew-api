import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class VerifiedUserError extends DomainError {
  constructor() {
    super(DomainErrorCodes.VERIFIED_USER, "User is already verified");
  }
  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
