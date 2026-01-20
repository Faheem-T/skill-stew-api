import { InfraError } from "./InfraError";
import { AppErrorCodes } from "../AppErrorCodes";

export class ESConnectionError extends InfraError {
  constructor(cause?: Error) {
    super(AppErrorCodes.ES_CONNECTION_ERROR, "Failed to connect to Elasticsearch", cause);
  }
}