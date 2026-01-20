import { AppError } from "../../application/errors/AppError.abstract";
import { 
  ESConnectionError,
  ESQueryError,
  ESTimeoutError,
  ESIndexNotFoundError,
  ESMappingError
} from "../../application/errors/infra";

/**
 * Maps any Elasticsearch error to a clean AppError
 */
export function mapESError(err: unknown): AppError {
  if (!err || typeof err !== "object") {
    return new ESQueryError("Unknown Elasticsearch error occurred");
  }

  const esError = err as any;

  // Connection-related errors
  if (isConnectionError(esError)) {
    return new ESConnectionError(esError);
  }

  // Index not found errors
  if (isIndexNotFoundError(esError)) {
    const indexName = extractIndexName(esError);
    return new ESIndexNotFoundError(indexName, esError);
  }

  // Timeout errors
  if (isTimeoutError(esError)) {
    return new ESTimeoutError(esError);
  }

  // Mapping errors
  if (isMappingError(esError)) {
    const message = extractMappingErrorMessage(esError);
    return new ESMappingError(message, esError);
  }

  // Query parsing errors
  if (isQueryError(esError)) {
    const message = extractQueryErrorMessage(esError);
    return new ESQueryError(message, esError);
  }

  // Fallback to generic query error
  return new ESQueryError(
    esError.message || "Elasticsearch operation failed",
    esError
  );
}

function isConnectionError(error: any): boolean {
  // Check for common connection error patterns
  const message = error.message?.toLowerCase() || '';
  const code = error.code;
  
  return (
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ECONNRESET' ||
    message.includes('connection') ||
    message.includes('connect') ||
    message.includes('network') ||
    error.meta?.statusCode === 503 ||
    error.statusCode === 503
  );
}

function isIndexNotFoundError(error: any): boolean {
  const message = error.message?.toLowerCase() || '';
  
  return (
    error.meta?.statusCode === 404 ||
    error.statusCode === 404 ||
    error.type === 'index_not_found_exception' ||
    message.includes('index_not_found') ||
    message.includes('no such index')
  );
}

function isTimeoutError(error: any): boolean {
  const message = error.message?.toLowerCase() || '';
  const code = error.code;
  
  return (
    code === 'ETIMEDOUT' ||
    message.includes('timeout') ||
    error.meta?.statusCode === 408 ||
    error.statusCode === 408 ||
    error.type === 'search_phase_execution_exception' && message.includes('timeout')
  );
}

function isMappingError(error: any): boolean {
  const message = error.message?.toLowerCase() || '';
  
  return (
    error.type === 'mapper_parsing_exception' ||
    error.type === 'illegal_argument_exception' && message.includes('mapping') ||
    message.includes('mapping') ||
    message.includes('mapper')
  );
}

function isQueryError(error: any): boolean {
  const message = error.message?.toLowerCase() || '';
  
  return (
    error.type === 'search_phase_execution_exception' ||
    error.type === 'query_parsing_exception' ||
    error.type === 'parsing_exception' ||
    message.includes('query') ||
    message.includes('parse')
  );
}

function extractIndexName(error: any): string {
  // Try to extract index name from various error properties
  if (error.meta?.body?._index) {
    return error.meta.body._index;
  }
  
  if (error.body?._index) {
    return error.body._index;
  }
  
  // Try to extract from error message
  const message = error.message || '';
  const match = message.match(/index_not_found_exception.*?no such index \[([^\]]+)\]/);
  if (match) {
    return match[1];
  }
  
  const genericMatch = message.match(/no such index \[([^\]]+)\]/);
  if (genericMatch) {
    return genericMatch[1];
  }
  
  return 'unknown';
}

function extractMappingErrorMessage(error: any): string {
  const message = error.message || 'Elasticsearch mapping error';
  
  // Try to extract field name from mapping errors
  const fieldMatch = message.match(/mapper \[([^\]]+)\]/);
  if (fieldMatch) {
    return `Mapping error for field '${fieldMatch[1]}'`;
  }
  
  return message;
}

function extractQueryErrorMessage(error: any): string {
  const message = error.message || 'Elasticsearch query error';
  
  // Try to extract more specific query error information
  if (message.includes('failed to parse')) {
    return 'Failed to parse Elasticsearch query';
  }
  
  if (message.includes('unknown field')) {
    const fieldMatch = message.match(/unknown field \[([^\]]+)\]/);
    if (fieldMatch) {
      return `Unknown field '${fieldMatch[1]}' in query`;
    }
  }
  
  return message;
}