import { DomainError } from "@skillstew/common";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class UserBlockedError extends DomainError {
  constructor() {
    super(DomainErrorCodes.USER_BLOCKED, "USER_BLOCKED");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
