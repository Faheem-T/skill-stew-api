import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class InvalidPlanDataError extends DomainError {
  constructor(message: string = "Invalid plan data provided") {
    super(DomainErrorCodes.INVALID_PLAN_DATA, message);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}