import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class BlockedUserError extends DomainError {
  constructor() {
    super(DomainErrorCodes.BLOCKED_USER, "User is blocked.");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
