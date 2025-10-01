import { z } from "zod";
import { passwordSchema } from "./PasswordValidator";

export const createAdminSchema = z.object({
  username: z.string(),
  password: passwordSchema,
});

export const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});
