import { z } from "zod";
import { PresentationErrorCodes } from "../errors/PresentationErrorCodes";

export const verifyEmailSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "Password has to be 8 characters")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/\d/, "Password must include at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must include at least one special character (@$!%*?&)",
    ),
});

export const resendVerifyEmailSchema = z.object({
  email: z.string().email(PresentationErrorCodes.INVALID_EMAIL_FORMAT_ERROR),
});

export const loginSchema = z.object({
  email: z.string().email(PresentationErrorCodes.INVALID_EMAIL_FORMAT_ERROR),
  password: z.string(),
});

export const registerSchema = z.object({
  email: z.string().email(PresentationErrorCodes.INVALID_EMAIL_FORMAT_ERROR),
});
