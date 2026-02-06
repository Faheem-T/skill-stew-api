import { z } from "zod";
import { IUserLocation } from "../../../domain/entities/UserProfile";

const userLocationSchema = z.object({
  placeId: z.string(),
});

export const onboardingUpdateUserProfileSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  avatarKey: z.string().optional(),
  location: userLocationSchema.optional(),
  languages: z.array(z.string()).optional(),
});

export type OnboardingUpdateUserProfileDTO = z.infer<
  typeof onboardingUpdateUserProfileSchema
>;

export type OnboardingUpdateUserProfileOutputDTO = {
  name?: string;
  avatarUrl?: string;
  location?: IUserLocation;
  languages?: string[];
};
