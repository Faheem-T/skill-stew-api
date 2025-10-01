import { DomainError } from "@skillstew/common";
import { DomainErrorCodes } from "./DomainErrorEnum";

export class DomainValidationError extends DomainError {
  constructor(code: keyof typeof DomainErrorCodes) {
    super(DomainErrorCodes[code], code);
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
