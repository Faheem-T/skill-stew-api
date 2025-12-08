import z from "zod";

export const verifyUserSchema = z.object({
  token: z.string(),
});

export type VerifyUserDTO = z.infer<typeof verifyUserSchema>;
