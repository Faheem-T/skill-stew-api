import { AllErrorCodes } from "./AllErrorCodes";
import { DomainErrorCodes } from "../../domain/errors/DomainErrorCodes";
import { AppErrorCodes } from "../../application/errors/AppErrorCodes";
import { HttpStatus } from "../../constants/HttpStatusCodes";

export const ErrorCodeToStatusCodeMap: Record<AllErrorCodes, number> = {
  // Domain Error Codes
  [DomainErrorCodes.NOT_FOUND_ERROR]: HttpStatus.NOT_FOUND,
  [DomainErrorCodes.UNAUTHORIZED_ACCESS]: HttpStatus.UNAUTHORIZED,
  [DomainErrorCodes.FORBIDDEN_OPERATION]: HttpStatus.FORBIDDEN,
  [DomainErrorCodes.ALREADY_EXISTS]: HttpStatus.CONFLICT,

  // App Error Codes
  [AppErrorCodes.INTERNAL_SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [AppErrorCodes.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,

  // Database Error Codes
  [AppErrorCodes.DB_CONNECTION_ERROR]: HttpStatus.SERVICE_UNAVAILABLE,
  [AppErrorCodes.DB_QUERY_ERROR]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.DB_TIMEOUT]: HttpStatus.REQUEST_TIMEOUT,
  [AppErrorCodes.DB_UNIQUE_CONSTRAINT]: HttpStatus.CONFLICT,

  // External Service Error Codes
  [AppErrorCodes.MESSAGE_QUEUE_ERROR]: HttpStatus.SERVICE_UNAVAILABLE,
  [AppErrorCodes.EXTERNAL_SERVICE_ERROR]: HttpStatus.SERVICE_UNAVAILABLE,
};
