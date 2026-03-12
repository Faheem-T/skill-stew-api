export enum JwtErrorCodes {
  ACCESS_TOKEN_VERIFY_ERROR = "Invalid access token",
  INVALID_TOKEN_ERROR = "Invalid token",
  INVALID_TOKEN_ROLE_ERROR = "Invalid role identifier",
  TOKEN_ROLE_MISMATCH_ERROR = "Role mismatch between payload and header",
}
