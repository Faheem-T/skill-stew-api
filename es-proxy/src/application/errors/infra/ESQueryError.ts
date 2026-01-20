import { InfraError } from "./InfraError";
import { AppErrorCodes } from "../AppErrorCodes";

export class ESQueryError extends InfraError {
  constructor(message: string = "Elasticsearch query failed", cause?: Error) {
    super(AppErrorCodes.ES_QUERY_ERROR, message, cause);
  }
}