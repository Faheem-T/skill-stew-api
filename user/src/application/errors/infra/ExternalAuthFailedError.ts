import { AppErrorCodes } from "../AppErrorCodes";
import { InfraError } from "./InfraError";

export class ExternalAuthFailedError extends InfraError {
  constructor(service: string, cause?: Error) {
    super(
      AppErrorCodes.INFRA_AUTH_FAILED,
      `${service} authentication failed`,
      cause,
    );
    this.service = service;
  }

  readonly service: string;

  toJSON() {
    return { errors: [{ message: "Authentication failed" }] };
  }
}
