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
  [DomainErrorCodes.VERIFIED_USER]: HttpStatus.CONFLICT,
  [DomainErrorCodes.UNAUTHORIZED]: HttpStatus.UNAUTHORIZED,
  [DomainErrorCodes.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [DomainErrorCodes.AUTH_PROVIDER_CONFLICT]: HttpStatus.CONFLICT,
  [DomainErrorCodes.SELF_CONNECTION_ERROR]: HttpStatus.CONFLICT,
  [DomainErrorCodes.ACCEPTING_REJECTED_CONNECTION_ERROR]: HttpStatus.CONFLICT,
  [DomainErrorCodes.REJECTING_ACCEPTED_CONNECTION_ERROR]: HttpStatus.CONFLICT,

  // App Error Codes
  [AppErrorCodes.INTERNAL_SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [AppErrorCodes.INVALID_AUTH_TOKEN]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,

  // Infra Error Codes
  [AppErrorCodes.INFRA_AUTH_FAILED]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.INFRA_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,

  // DB Error Codes
  [AppErrorCodes.DB_CONNECTION_ERROR]: HttpStatus.SERVICE_UNAVAILABLE,
  [AppErrorCodes.DB_TIMEOUT]: HttpStatus.REQUEST_TIMEOUT,
  [AppErrorCodes.DB_QUERY_ERROR]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.DB_UNIQUE_CONSTRAINT]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.DB_FOREIGN_KEY_CONSTRAINT]: HttpStatus.BAD_REQUEST,
};
