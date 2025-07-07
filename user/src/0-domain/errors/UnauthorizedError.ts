import { DomainError } from "../../core/errors/AppError";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class UnauthorizedError extends DomainError {
  constructor() {
    super(DomainErrorCodes.UNAUTHORIZED, "UNAUTHORIZED");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
