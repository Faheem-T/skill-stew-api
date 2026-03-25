import z from "zod";

export const getCurrentAdminProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  role: z.enum(["ADMIN"]),
  username: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type GetCurrentAdminProfileDTO = z.infer<
  typeof getCurrentAdminProfileSchema
>;
