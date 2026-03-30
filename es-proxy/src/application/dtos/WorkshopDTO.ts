import z from "zod";

export const upsertWorkshopDTO = z.object({
  id: z.uuid(),
  expertId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  targetAudience: z.string().nullable(),
  bannerImageKey: z.string().nullable(),
  publishedAt: z.string(),
  sessionTitles: z.array(z.string()),
  sessionDescriptions: z.array(z.string()),
});

export type UpsertWorkshopDTO = z.infer<typeof upsertWorkshopDTO>;
