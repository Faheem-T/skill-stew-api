import z from "zod";

// create
export const createSubscriptionPlanSchema = z.object({
  name: z.string(),
  description: z.string("A description is required"),
  active: z.boolean().optional().default(true),
  monthlyPrice: z.number(),
  yearlyPrice: z.number(),
  freeWorkshopHours: z.number(),
  currency: z.string().optional(),
  features: z.string().array(),
});

export type CreateSubscriptionPlanDto = z.infer<
  typeof createSubscriptionPlanSchema
>;

// edit
export const editSubscriptionPlanSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  active: z.boolean().optional(),
  monthlyPrice: z.number().optional(),
  yearlyPrice: z.number().optional(),
  freeWorkshopHours: z.number().optional(),
  currency: z.string().optional(),
  features: z.string().array().optional(),
});

export type EditSubscriptionPlanDto = z.infer<
  typeof editSubscriptionPlanSchema
>;
