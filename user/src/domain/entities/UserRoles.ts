export const USER_ROLES = [
  "USER",
  "EXPERT",
  "EXPERT_APPLICANT",
  "ADMIN",
] as const;
export type UserRoles = (typeof USER_ROLES)[number];
