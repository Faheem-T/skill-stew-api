import z from "zod";

export const skillCreatedSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  normalizedName: z.string(),
  alternateNames: z.array(z.string()),
  status: z.string(),
});

export const skillUpdatedSchema = skillCreatedSchema;

export const skillDeletedSchema = z.object({ id: z.uuid() });

export const skillProfileUpdatedSchema = z.object({
  userId: z.uuid(),
  offered: z.array(z.string()),
  wanted: z.array(z.string()),
});

export const SkillsEventSchemas = {
  "skill.created": skillCreatedSchema,
  "skill.profileUpdated": skillProfileUpdatedSchema,
  "skill.updated": skillUpdatedSchema,
  "skill.deleted": skillDeletedSchema,
} as const;
