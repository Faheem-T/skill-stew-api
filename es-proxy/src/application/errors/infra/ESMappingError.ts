import { InfraError } from "./InfraError";
import { AppErrorCodes } from "../AppErrorCodes";

export class ESMappingError extends InfraError {
  constructor(message: string = "Elasticsearch mapping error", cause?: Error) {
    super(AppErrorCodes.ES_MAPPING_ERROR, message, cause);
  }
}