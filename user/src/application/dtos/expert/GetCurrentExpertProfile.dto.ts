import z from "zod";

export const getCurrentExpertProfileOutputSchema = z.object({
  id: z.string(),
  role: z.literal("EXPERT"),
  email: z.string().email(),
  bio: z.string(),
  socialLinks: z.array(z.string()),
  fullName: z.string(),
  joinedAt: z.date(),
  languages: z.array(z.string()),
  phone: z.string(),
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

export type GetCurrentExpertProfileOutputDTO = z.infer<
  typeof getCurrentExpertProfileOutputSchema
>;
