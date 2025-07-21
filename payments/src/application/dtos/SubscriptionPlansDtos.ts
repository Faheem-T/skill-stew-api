import z from "zod";

export const createSubscriptionPlanSchema = z.object({
  name: z.string(),
  monthlyPrice: z.number(),
  yearlyPrice: z.number(),
  freeWorkshopHours: z.number(),
  currency: z.string().optional(),
});

export type CreateSubscriptionPlanDto = z.infer<
  typeof createSubscriptionPlanSchema
>;
