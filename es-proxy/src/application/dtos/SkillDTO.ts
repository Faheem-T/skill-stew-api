import z from "zod";

export const createSkillDTO = z.object({
  id: z.string(),
  name: z.string(),
  alternateNames: z.array(z.string()),
});

export type CreateSkillDTO = z.infer<typeof createSkillDTO>;

export const updateSkillDTO = z.object({
  id: z.string(),
  name: z.string().optional(),
  alternateNames: z.array(z.string()).optional(),
});

export type UpdateSkillDTO = z.infer<typeof updateSkillDTO>;

export type SkillOutputDTO = {
  id: string;
  name: string;
  alternateNames: string[];
}[];
