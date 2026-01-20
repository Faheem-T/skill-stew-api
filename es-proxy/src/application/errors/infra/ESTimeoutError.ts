import { InfraError } from "./InfraError";
import { AppErrorCodes } from "../AppErrorCodes";

export class ESTimeoutError extends InfraError {
  constructor(cause?: Error) {
    super(AppErrorCodes.ES_TIMEOUT_ERROR, "Elasticsearch operation timed out", cause);
  }
}