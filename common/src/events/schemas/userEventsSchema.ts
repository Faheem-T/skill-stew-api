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
  name: z.string().optional(),
  username: z.string().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      formattedAddress: z.string(),
    })
    .optional(),
  languages: z.array(z.string()).optional(),
});

export const UserEventSchemas = {
  "user.registered": userRegisteredSchema,
  "user.verified": userVerifiedSchema,
  "user.profileUpdated": userProfileUpdatedSchema,
} as const;
