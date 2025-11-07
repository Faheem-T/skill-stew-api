import z from "zod";

export const userRegisteredSchema = z.object({
  id: z.uuid(),
  email: z.email(),
});

export const userVerifiedSchema = z.object({
  id: z.uuid(),
});

export const userProfileUpdatedSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  username: z.string(),
  location: z.object({ latitude: z.number(), longitude: z.number() }),
  languages: z.array(z.string()),
});

export const UserEventSchemas = {
  "user.registered": userRegisteredSchema,
  "user.verified": userVerifiedSchema,
  "user.profileUpdated": userProfileUpdatedSchema,
} as const;
