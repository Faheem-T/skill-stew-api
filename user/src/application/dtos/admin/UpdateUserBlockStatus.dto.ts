import z from "zod";

export const updateUserBlockStatusSchema = z.object({
  userId: z.string(),
  newBlockStatus: z.boolean(),
});

export type UpdateUserBlockStatusDTO = z.infer<
  typeof updateUserBlockStatusSchema
>;
