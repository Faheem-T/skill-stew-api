import { DomainError } from "../../core/errors/AppError";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`${DomainErrorCodes.USER_ALREADY_EXISTS}`, "USER_ALREADY_EXISTS");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
