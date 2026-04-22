export const PaymentStatus = [
  "PENDING",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
] as const;

export type PaymentStatus = (typeof PaymentStatus)[number];
