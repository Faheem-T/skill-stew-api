import { z } from "zod";

const userLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export const onboardingUpdateUserProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  avatarKey: z.string().optional(),
  location: userLocationSchema.optional(),
  languages: z.array(z.string()).optional(),
});

export type OnboardingUpdateUserProfileDTO = z.infer<typeof onboardingUpdateUserProfileSchema>;
