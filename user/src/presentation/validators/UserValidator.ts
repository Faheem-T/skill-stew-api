import { z } from "zod";
import { PresentationErrorCodes } from "../errors/PresentationErrorCodes";
import { passwordSchema } from "./PasswordValidator";

export const verifyEmailSchema = z.object({
  token: z.string(),
  password: passwordSchema,
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
  password: passwordSchema,
});
