import z from "zod";

export const upsertExpertDTO = z.object({
  id: z.uuid(),
  username: z.string(),
  fullName: z.string(),
  bio: z.string(),
  yearsExperience: z.number(),
});

export type UpsertExpertDTO = z.infer<typeof upsertExpertDTO>;
