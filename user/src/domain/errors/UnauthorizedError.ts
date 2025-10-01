import { DomainError } from "@skillstew/common";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class UnauthorizedError extends DomainError {
  constructor() {
    super(DomainErrorCodes.UNAUTHORIZED, "UNAUTHORIZED");
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
