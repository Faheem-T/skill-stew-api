import { DomainError } from "./DomainError.abstract";

export class BlockedUserError extends DomainError {
  constructor() {
    super("BLOCKED_USER", "User is blocked.");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
