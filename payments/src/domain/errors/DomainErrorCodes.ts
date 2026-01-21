export const DomainErrorCodes = {
  NOT_FOUND_ERROR: "NOT_FOUND_ERROR",
  PLAN_NOT_ACTIVE: "PLAN_NOT_ACTIVE",
  PLAN_ALREADY_EXISTS: "PLAN_ALREADY_EXISTS",
  INVALID_PLAN_DATA: "INVALID_PLAN_DATA",
} as const;

export type DomainErrorCodes = keyof typeof DomainErrorCodes;