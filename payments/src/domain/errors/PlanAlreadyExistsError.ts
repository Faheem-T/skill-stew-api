import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class PlanAlreadyExistsError extends DomainError {
  constructor(planName: string) {
    super(DomainErrorCodes.PLAN_ALREADY_EXISTS, `Plan '${planName}' already exists`);
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message, field: "name" }] };
  }
}