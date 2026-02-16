import { AppError } from "./AppError.abstract";
import { AppErrorCodes } from "./AppErrorCodes";

export class JwtError extends AppError {
  constructor(code: AppErrorCodes, err?: Error) {
    super(code, AppErrorCodes[code], err, false);
  }
  toJSON() {
    return {
      errors: [
        {
          message: this.message,
        },
      ],
    };
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
