import { InfrastructureError } from "../../core/errors/AppError";
import { JwtErrorCodes } from "./JwtErrorCodes";

export class JwtError extends InfrastructureError {
  constructor(code: keyof typeof JwtErrorCodes) {
    super(JwtErrorCodes[code], code);
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}

export class EmailVerificationJwtVerifyError extends JwtError {
  constructor() {
    super("EMAIL_VERIFICATION_JWT_VERIFY_ERROR");
  }
}
