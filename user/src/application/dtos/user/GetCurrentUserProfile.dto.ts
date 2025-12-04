import z from "zod";

export const getCurrentUserProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string(),
  role: z.enum(["USER"]),
  username: z.string().optional(),
  phoneNumber: z.string().optional(),
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  timezone: z.string().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      placeId: z.string(),
      formattedAddress: z.string(),
    })
    .optional(),
  about: z.string().optional(),
  socialLinks: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type GetCurrentUserProfileDTO = z.infer<
  typeof getCurrentUserProfileSchema
>;
