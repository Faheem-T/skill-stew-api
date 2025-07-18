import { DomainError } from "../../core/errors/AppError";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class WrongAdminUsernameError extends DomainError {
  constructor() {
    super(DomainErrorCodes.WRONG_ADMIN_USERNAME, "WRONG_ADMIN_USERNAME");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
