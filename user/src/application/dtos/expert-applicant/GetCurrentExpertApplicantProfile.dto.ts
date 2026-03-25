import z from "zod";

export const getCurrentExpertApplicantProfileOutputSchema = z.object({
  id: z.string(),
  role: z.literal("EXPERT_APPLICANT"),
  email: z.string().email(),
  applicationStatus: z.enum(["NOT_DONE", "VERIFICATION_PENDING", "REJECTED"]),
});

export type GetCurrentExpertApplicantProfileOutputDTO = z.infer<
  typeof getCurrentExpertApplicantProfileOutputSchema
>;
