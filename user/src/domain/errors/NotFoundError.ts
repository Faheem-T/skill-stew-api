import { DomainError } from "./DomainError.abstract";

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super("NOT_FOUND_ERROR", `${resource} not found.`);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
