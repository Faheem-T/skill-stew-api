import { DomainError } from "@skillstew/common";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class UserNotVerifiedError extends DomainError {
  constructor() {
    super(DomainErrorCodes.USER_NOT_VERIFIED, "USER_NOT_VERIFIED");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
