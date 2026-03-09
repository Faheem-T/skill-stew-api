import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class NotFoundError extends DomainError {
  constructor(resource: string = "Resource") {
    super(DomainErrorCodes.NOT_FOUND_ERROR, `${resource} not found.`);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}