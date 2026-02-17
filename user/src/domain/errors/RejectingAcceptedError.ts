import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class RejectingAcceptedConnectionError extends DomainError {
  constructor() {
    super(
      DomainErrorCodes.REJECTING_ACCEPTED_CONNECTION_ERROR,
      "You have already accepted this connection",
    );
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
