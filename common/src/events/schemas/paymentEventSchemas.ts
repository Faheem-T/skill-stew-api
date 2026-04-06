import z from "zod";

export const paymentOutcomeSchema = z
  .object({
    membershipId: z.string(),
    paymentId: z.string(),
    userId: z.string(),
    occurredAt: z.iso.datetime(),
  })
  .strict();

export const PaymentEventSchemas = {
  "payment.succeeded": paymentOutcomeSchema,
  "payment.failed": paymentOutcomeSchema,
  "payment.refunded": paymentOutcomeSchema,
} as const;
