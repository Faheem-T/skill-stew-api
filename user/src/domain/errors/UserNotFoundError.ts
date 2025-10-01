import { DomainError } from "@skillstew/common";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class UserNotFoundError extends DomainError {
  constructor() {
    super(DomainErrorCodes.USER_NOT_FOUND, "USER_NOT_FOUND");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
