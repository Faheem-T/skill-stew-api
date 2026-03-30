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

export const skillProfileUpdatedSchema = z
  .object({
    userId: z.uuid(),
    offered: z.array(z.object({ id: z.string(), name: z.string() })),
    wanted: z.array(z.object({ id: z.string(), name: z.string() })),
  })
  .strict();

export const workshopPublishedSchema = z
  .object({
    id: z.uuid(),
    expertId: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    targetAudience: z.string().nullable(),
    bannerImageKey: z.string().nullable(),
    publishedAt: z.iso.datetime(),
    sessionTitles: z.array(z.string()),
    sessionDescriptions: z.array(z.string()),
  })
  .strict();

export const SkillsEventSchemas = {
  "skill.created": skillCreatedSchema,
  "skill.profileUpdated": skillProfileUpdatedSchema,
  "skill.updated": skillUpdatedSchema,
  "skill.deleted": skillDeletedSchema,
  "workshop.published": workshopPublishedSchema,
} as const;
