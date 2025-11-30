import { z } from "zod";

const userLocationSchema = z.object({
  placeId: z.string(),
});

export const updateProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
  avatarKey: z.string().optional(),
  timezone: z.string().optional(),
  location: userLocationSchema.optional(),
  about: z.string().optional(),
  socialLinks: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
