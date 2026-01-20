export const DomainErrorCodes = {
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  INVALID_SEARCH_CRITERIA: "INVALID_SEARCH_CRITERIA",
} as const;

export type DomainErrorCodes = keyof typeof DomainErrorCodes;

