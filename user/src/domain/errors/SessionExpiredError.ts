import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class SessionExpiredError extends DomainError {
  constructor() {
    super(DomainErrorCodes.SESSION_EXPIRED, "Session expired");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
