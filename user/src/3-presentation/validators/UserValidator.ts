import { z } from "zod";
import { PresentationErrorCodes } from "../errors/PresentationErrorCodes";

export const verifyEmailSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, "Password has to be 8 characters")
    .regex(
      /^(?=(.*[a-z]){3,})(?=(.*[A-Z]){2,})(?=(.*[0-9]){2,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/,
      "Password has to have atleast the following: 1 upper case letter, 1 lower case letter, 1 number, 1 special character",
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
