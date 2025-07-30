import { ApplicationError } from "@skillstew/common";

const GoogleAuthErrorCodes = {
  INVALID_GOOGLE_AUTH_CREDENTIAL: "Invalid google auth credential",
  LOCAL_ACCOUNT_EXISTS:
    "A local account with this email exists. Log in using email and password",
  GOOGLE_ACCOUNT_EXISTS: "This email has been used to sign in with google",
} as const;

export class GoogleAuthError extends ApplicationError {
  code: keyof typeof GoogleAuthErrorCodes;
  constructor(code: keyof typeof GoogleAuthErrorCodes) {
    super(GoogleAuthErrorCodes[code], code);
    this.code = code;
  }
  toJSON(): object {
    return { error: this.name, message: this.message, code: this.code };
  }
}
