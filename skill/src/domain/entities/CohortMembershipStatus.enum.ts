export const CohortMembershipStatus = [
  "pending_payment",
  "active",
  "payment_failed",
  "expired",
  "dropped",
  "refunded",
  "awaiting_reconciliation",
] as const;

export type CohortMembershipStatus = (typeof CohortMembershipStatus)[number];
