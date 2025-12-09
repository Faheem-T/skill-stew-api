import { DomainError } from "./DomainError.abstract";

export class SessionExpiredError extends DomainError {
  constructor() {
    super("SESSION_EXPIRED", "Session expired");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
