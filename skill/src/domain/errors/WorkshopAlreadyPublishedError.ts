import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class WorkshopAlreadyPublishedError extends DomainError {
  constructor() {
    super(
      DomainErrorCodes.WORKSHOP_ALREADY_PUBLISHED,
      "Workshop is already published.",
    );
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
