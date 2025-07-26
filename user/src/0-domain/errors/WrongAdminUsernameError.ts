import { DomainError } from "@skillstew/common";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class WrongAdminUsernameError extends DomainError {
  constructor() {
    super(DomainErrorCodes.WRONG_ADMIN_USERNAME, "WRONG_ADMIN_USERNAME");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
