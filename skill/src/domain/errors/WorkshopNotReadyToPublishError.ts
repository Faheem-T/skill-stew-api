import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class WorkshopNotReadyToPublishError extends DomainError {
  constructor(
    public readonly errors: Array<{ message: string; field?: string }>,
  ) {
    super(
      DomainErrorCodes.WORKSHOP_NOT_READY_TO_PUBLISH,
      "Workshop is not ready to publish.",
    );
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: this.errors };
  }
}
