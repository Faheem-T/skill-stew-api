export const OutboxEventStatus = ["PENDING", "PROCESSED"] as const;
export type OutboxEventStatus = (typeof OutboxEventStatus)[number];
