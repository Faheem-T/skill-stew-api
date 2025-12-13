import { HttpStatus } from "@skillstew/common";
import { AllErrorCodes } from "./AllErrorCodes";
import { DomainErrorCodes } from "../../domain/errors/DomainErrorCodes";
import { AppErrorCodes } from "../../application/errors/AppErrorCodes";

export const ErrorCodeToStatusCodeMap: Record<AllErrorCodes, number> = {
  // Domain Error Codes
  [DomainErrorCodes.BLOCKED_USER]: HttpStatus.FORBIDDEN,
  [DomainErrorCodes.FORBIDDEN]: HttpStatus.FORBIDDEN,
  [DomainErrorCodes.INVALID_CREDENTIALS]: HttpStatus.BAD_REQUEST,
  [DomainErrorCodes.NOT_FOUND_ERROR]: HttpStatus.NOT_FOUND,
  [DomainErrorCodes.SESSION_EXPIRED]: HttpStatus.UNAUTHORIZED,
  [DomainErrorCodes.VERIFIED_USER]: HttpStatus.CONFLICT,
  [DomainErrorCodes.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [DomainErrorCodes.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [DomainErrorCodes.AUTH_PROVIDER_CONFLICT]: HttpStatus.CONFLICT,

  // App Error Codes
  [AppErrorCodes.INTERNAL_SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [AppErrorCodes.CONFLICT]: HttpStatus.CONFLICT,
  [AppErrorCodes.INFRA_AUTH_FAILED]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.INFRA_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
};
