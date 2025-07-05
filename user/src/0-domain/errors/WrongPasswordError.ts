import { DomainError } from "../../core/errors/AppError";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class WrongPasswordError extends DomainError {
  constructor() {
    super(DomainErrorCodes.WRONG_PASSWORD, "WRONG_PASSWORD");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
