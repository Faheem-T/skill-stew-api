import { InfraError } from "./InfraError";
import { AppErrorCodes } from "../AppErrorCodes";

export class ESIndexNotFoundError extends InfraError {
  constructor(index: string, cause?: Error) {
    super(AppErrorCodes.ES_INDEX_NOT_FOUND, `Elasticsearch index '${index}' not found`, cause);
  }
}