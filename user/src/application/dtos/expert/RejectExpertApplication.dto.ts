import z from "zod";

export const rejectExpertApplicationSchema = z.object({
  applicationId: z.string().trim().min(1),
  rejectionReason: z.string().trim().min(1).optional(),
  adminId: z.string().trim().min(1),
});

export type RejectExpertApplicationDTO = z.infer<
  typeof rejectExpertApplicationSchema
>;
