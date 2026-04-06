import z from "zod";

export const createCheckoutSessionDTO = z.object({
  membershipId: z.string().trim().min(1),
  cohortId: z.string().trim().min(1),
  workshopId: z.string().trim().min(1),
  expertId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  amount: z.number().int().min(0),
  currency: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => /^[A-Z]{3}$/.test(value)),
});

export type CreateCheckoutSessionDTO = z.infer<typeof createCheckoutSessionDTO>;

export const publishPaymentOutcomeDTO = z.object({
  membershipId: z.string().trim().min(1),
  paymentId: z.string().trim().min(1),
  userId: z.string().trim().min(1),
  status: z.enum(["succeeded", "failed", "refunded"]),
});

export type PublishPaymentOutcomeDTO = z.infer<typeof publishPaymentOutcomeDTO>;
