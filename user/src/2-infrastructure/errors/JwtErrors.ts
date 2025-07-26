import { InfrastructureError } from "@skillstew/common";
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

export class RefreshTokenVerifyError extends JwtError {
  constructor() {
    super("REFRESH_TOKEN_VERIFY_ERROR");
  }
}

export class AccessTokenVerifyError extends JwtError {
  constructor() {
    super("ACCESS_TOKEN_VERIFY_ERROR");
  }
}

export class InvalidTokenError extends JwtError {
  constructor() {
    super("INVALID_TOKEN_ERROR");
  }
}

export class InvalidTokenRoleError extends JwtError {
  constructor() {
    super("INVALID_TOKEN_ROLE_ERROR");
  }
}

export class TokenRoleMismatchError extends JwtError {
  constructor() {
    super("TOKEN_ROLE_MISMATCH_ERROR");
  }
}
