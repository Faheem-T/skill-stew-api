import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class AcceptingRejectedConnectionError extends DomainError {
  constructor() {
    super(
      DomainErrorCodes.ACCEPTING_REJECTED_CONNECTION_ERROR,
      "You have already rejected this connection",
    );
  }

  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
