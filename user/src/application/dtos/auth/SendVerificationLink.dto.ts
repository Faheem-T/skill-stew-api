import z from "zod";

export const sendVerificationLinkSchema = z.object({
  email: z.string().email(),
});

export type SendVerificationLinkDTO = z.infer<
  typeof sendVerificationLinkSchema
>;
