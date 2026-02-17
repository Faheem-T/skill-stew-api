export const UserConnectionStatus = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
] as const;
export type UserConnectionStatus = (typeof UserConnectionStatus)[number];
