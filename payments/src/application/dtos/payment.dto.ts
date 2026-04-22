import z from "zod";

export const createCheckoutSessionDTO = z.object({
  membershipId: z.string().trim().min(1),
  cohortId: z.string().trim().min(1),
  workshopId: z.string().trim().min(1),
  workshopTitle: z.string().trim().min(1),
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

export const stripeWebhookDTO = z.object({
  signature: z.string().trim().min(1),
  rawBody: z.instanceof(Buffer),
});

export type StripeWebhookDTO = z.infer<typeof stripeWebhookDTO>;
