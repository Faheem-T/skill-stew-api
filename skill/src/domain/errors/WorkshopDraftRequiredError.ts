import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class WorkshopDraftRequiredError extends DomainError {
  constructor() {
    super(
      DomainErrorCodes.WORKSHOP_DRAFT_REQUIRED,
      "Only draft workshops can be edited.",
    );
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
