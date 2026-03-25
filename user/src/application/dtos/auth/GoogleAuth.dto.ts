import z from "zod";

export const googleAuthSchema = z.object({
  credential: z.string().min(1),
  requestedRole: z.enum(["USER", "EXPERT_APPLICANT"]),
});

export type GoogleAuthDTO = z.infer<typeof googleAuthSchema>;
