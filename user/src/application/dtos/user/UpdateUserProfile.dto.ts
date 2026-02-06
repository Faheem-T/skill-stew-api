import { z } from "zod";
import { IUserLocation } from "../../../domain/entities/UserProfile";

const userLocationSchema = z.object({
  placeId: z.string(),
});

export const updateProfileSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  phoneNumber: z.string().optional(),
  avatarKey: z.string().optional(),
  bannerKey: z.string().optional(),
  timezone: z.string().optional(),
  location: userLocationSchema.optional(),
  about: z.string().optional(),
  socialLinks: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;

export type UpdateProfileOutputDTO = {
  name?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  timezone?: string;
  location?: IUserLocation;
  about?: string;
  socialLinks?: string[];
  languages?: string[];
};
