import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class ForbiddenOperationError extends DomainError {
  constructor(message: string = "You do not have permission to perform this operation.") {
    super(DomainErrorCodes.FORBIDDEN_OPERATION, message);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
