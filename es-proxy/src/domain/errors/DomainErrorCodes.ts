export const DomainErrorCodes = {
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
} as const;

export type DomainErrorCodes = keyof typeof DomainErrorCodes;

