export const USER_ROLES = ["USER", "EXPERT", "ADMIN"] as const;
export type UserRoles = (typeof USER_ROLES)[number];
