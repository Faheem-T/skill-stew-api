import { DomainError } from "./DomainError.abstract";

export class ForbiddenError extends DomainError {
  constructor() {
    super("FORBIDDEN", "Forbidden.");
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
