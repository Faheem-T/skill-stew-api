import { DomainError } from "./DomainError.abstract";

export class VerifiedUserError extends DomainError {
  constructor() {
    super("VERIFIED_USER", "User is already verified");
  }
  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
