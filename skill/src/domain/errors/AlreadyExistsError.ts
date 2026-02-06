import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class AlreadyExistsError extends DomainError {
  constructor(resource: string = "Resource") {
    super(DomainErrorCodes.ALREADY_EXISTS, `${resource} already exists.`);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}