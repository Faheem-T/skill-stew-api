import { AppErrorCodes } from "../AppErrorCodes";
import { TransientInfraError } from "./TransientInfraError";

export class ServiceUnavailableError extends TransientInfraError {
  constructor(service: string, cause?: Error) {
    super(AppErrorCodes.INFRA_UNAVAILABLE, `${service} is unavailable`, cause);
    this.service = service;
  }

  readonly service: string;

  toJSON() {
    return { errors: [{ message: "Service temporarily unavailable" }] };
  }
}
