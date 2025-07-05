import { DomainError } from "../../core/errors/AppError";

export class DomainValidationError extends DomainError {
  constructor(code: keyof typeof DomainErrorCodes) {
    super(DomainErrorCodes[code], code);
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
