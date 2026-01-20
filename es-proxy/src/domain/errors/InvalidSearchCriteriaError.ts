import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class InvalidSearchCriteriaError extends DomainError {
  constructor(message: string = "Invalid search criteria provided") {
    super(DomainErrorCodes.INVALID_SEARCH_CRITERIA, message);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}