import { AppErrorCodes } from "../../application/errors/AppErrorCodes";
import { DomainErrorCodes } from "../../domain/errors/DomainErrorCodes";

export const AllErrorCodes = {
  ...DomainErrorCodes,
  ...AppErrorCodes,
};

export type AllErrorCodes = keyof typeof AllErrorCodes;

