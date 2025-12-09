import { HttpStatus } from "@skillstew/common";
import { AllErrorCodes } from "./AllErrorCodes";

export const ErrorCodeToStatusCodeMap: Record<AllErrorCodes, number> = {
  BLOCKED_USER: HttpStatus.FORBIDDEN,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  INVALID_CREDENTIALS: HttpStatus.BAD_REQUEST,
  NOT_FOUND_ERROR: HttpStatus.NOT_FOUND,
  SESSION_EXPIRED: HttpStatus.UNAUTHORIZED,
  VERIFIED_USER: HttpStatus.CONFLICT,
  UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
};
