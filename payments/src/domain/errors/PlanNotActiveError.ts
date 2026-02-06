import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class PlanNotActiveError extends DomainError {
  constructor(planName: string) {
    super(DomainErrorCodes.PLAN_NOT_ACTIVE, `Plan '${planName}' is not active`);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}