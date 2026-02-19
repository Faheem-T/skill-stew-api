export const DomainErrorCodes = {
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
  FORBIDDEN_OPERATION: "FORBIDDEN_OPERATION",
} as const;

export type DomainErrorCodes = keyof typeof DomainErrorCodes;
