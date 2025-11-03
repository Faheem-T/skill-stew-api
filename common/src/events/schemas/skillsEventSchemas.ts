import z from "zod";

export const skillCreatedSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  normalizedName: z.string(),
  alternateNames: z.array(z.string()),
  status: z.string(),
});

export const SkillsEventSchemas = {
  "skill.created": skillCreatedSchema,
} as const;
