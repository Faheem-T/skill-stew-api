export const UserConnectionStatus = ["PENDING", "ACCEPTED"] as const;
export type UserConnectionStatus = (typeof UserConnectionStatus)[number];
