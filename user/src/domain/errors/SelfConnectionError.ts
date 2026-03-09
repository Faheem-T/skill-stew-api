import { DomainError } from "./DomainError.abstract";
import { DomainErrorCodes } from "./DomainErrorCodes";

export class SelfConnectionError extends DomainError {
  constructor() {
    super(
      DomainErrorCodes.SELF_CONNECTION_ERROR,
      "You cannot send a connection request to yourself",
    );
  }
  toJSON(): { errors: { message: string; field?: string }[] } {
    return { errors: [{ message: this.message }] };
  }
}
