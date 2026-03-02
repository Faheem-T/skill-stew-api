import z from "zod";

export const getUserProfileSchema = z.object({
  userId: z.string(),
});

export type GetUserProfileDTO = z.infer<typeof getUserProfileSchema>;

export interface GetUserProfileOutputDTO {
  userId: string;
  username?: string;
  isVerified: boolean;
  name?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  timezone?: string;
  about?: string;
  socialLinks?: string[];
  languages?: string[];
  location?: string;
}
