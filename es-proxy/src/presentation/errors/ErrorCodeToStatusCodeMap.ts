import { HttpStatus } from "@skillstew/common";
import { AllErrorCodes } from "./AllErrorCodes";
import { DomainErrorCodes } from "../../domain/errors/DomainErrorCodes";
import { AppErrorCodes } from "../../application/errors/AppErrorCodes";

export const ErrorCodeToStatusCodeMap: Record<AllErrorCodes, number> = {
  // Domain Error Codes
  [DomainErrorCodes.NOT_FOUND_ERROR]: HttpStatus.NOT_FOUND,

  // App Error Codes
  [AppErrorCodes.INTERNAL_SERVER_ERROR]: HttpStatus.INTERNAL_SERVER_ERROR,
  [AppErrorCodes.VALIDATION_ERROR]: HttpStatus.BAD_REQUEST,

  // Infra Error Codes
  [AppErrorCodes.INFRA_UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,

  // ES Error Codes
  [AppErrorCodes.ES_CONNECTION_ERROR]: HttpStatus.SERVICE_UNAVAILABLE,
  [AppErrorCodes.ES_QUERY_ERROR]: HttpStatus.BAD_REQUEST,
  [AppErrorCodes.ES_TIMEOUT_ERROR]: HttpStatus.REQUEST_TIMEOUT,
  [AppErrorCodes.ES_INDEX_NOT_FOUND]: HttpStatus.NOT_FOUND,
  [AppErrorCodes.ES_MAPPING_ERROR]: HttpStatus.BAD_REQUEST,
};

