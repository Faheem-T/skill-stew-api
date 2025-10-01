export enum DomainErrorCodes {
  DOMAIN_EXPERT_ONLY_FIELD = "Field can only be set for EXPERT",
  DOMAIN_USER_ONLY_FIELD = "Field can only be set for USER",
  USER_ALREADY_VERIFIED = "User is already verified",
  USER_ALREADY_EXISTS = "User already exists",
  USER_NOT_FOUND = "User not found",
  WRONG_PASSWORD = "Incorrect password",
  USER_NOT_VERIFIED = "User has not been verified",
  UNAUTHORIZED = "You are not authorized",
  USER_BLOCKED = "You cannot continue as you have been blocked",

  // Admin related
  WRONG_ADMIN_USERNAME = "Incorrect username",
}
