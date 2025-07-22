import z from "zod";

// create
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

// edit
export const editSubscriptionPlanSchema = z.object({
  name: z.string().optional(),
  monthly_price: z.number().optional(),
  yearly_price: z.number().optional(),
  free_workshop_hours: z.number().optional(),
  currency: z.string().optional(),
});

export type EditSubscriptionPlanDto = z.infer<
  typeof editSubscriptionPlanSchema
>;
