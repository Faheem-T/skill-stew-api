import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class NotFoundError extends DomainError {
  constructor(entity: string) {
    super(DomainErrorCodes.NOT_FOUND_ERROR, `${entity} not found`);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}