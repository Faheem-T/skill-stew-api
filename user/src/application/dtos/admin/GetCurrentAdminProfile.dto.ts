import z from "zod";

export const getCurrentAdminProfileSchema = z.object({
  email: z.string(),
  role: z.enum(["ADMIN"]),
  username: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type GetCurrentAdminProfileDTO = z.infer<
  typeof getCurrentAdminProfileSchema
>;
