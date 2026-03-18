import z from "zod";

export const resendVerificationLinkRequestedSchema = z.object({
  email: z.email(),
  token: z.string(),
});

export const authProviderLinkedSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  role: z.enum(["USER", "EXPERT", "EXPERT_APPLICANT", "ADMIN"]),
  provider: z.literal("google"),
});

export const AuthEventSchemas = {
  "resendVerificationLink.requested": resendVerificationLinkRequestedSchema,
  "auth.providerLinked": authProviderLinkedSchema,
} as const;
