import z from "zod";

export const resendVerificationLinkRequestedSchema = z.object({
  email: z.email(),
  token: z.string(),
});

export const AuthEventSchemas = {
  "resendVerificationLink.requested": resendVerificationLinkRequestedSchema,
} as const;
