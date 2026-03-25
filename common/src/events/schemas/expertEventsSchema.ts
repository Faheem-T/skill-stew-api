import z from "zod";

export const expertRegisteredSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  token: z.string().optional(),
});

export const newExpertOnboardedSchema = z.object({
  expertId: z.uuid(),
  fullName: z.string(),
  bio: z.string(),
  socialLinks: z.array(z.string()),
  username: z.string(),
  yearsExperience: z.number(),
  hasTeachingExperience: z.boolean(),
  teachingExperienceDesc: z.string(),
});

export const expertVerifiedSchema = z.object({
  id: z.uuid(),
});

export const expertApplicationApprovedSchema = z.object({
  expertId: z.uuid(),
  email: z.email(),
  approvedAt: z.coerce.date(),
});

export const expertApplicationSubmittedSchema = z.object({
  applicationId: z.uuid(),
  expertId: z.uuid(),
  expertUsername: z.string().optional(),
  expertEmail: z.email(),
  adminRecipientIds: z.array(z.uuid()),
  submittedAt: z.coerce.date(),
});

export const expertApplicationRejectedSchema = z.object({
  expertId: z.uuid(),
  email: z.email(),
  rejectedReason: z.string().optional(),
  rejectedAt: z.coerce.date(),
});

export const ExpertEventSchemas = {
  "expert.registered": expertRegisteredSchema,
  "expert.onboarded": newExpertOnboardedSchema,
  "expert.verified": expertVerifiedSchema,
  "expert.application.submitted": expertApplicationSubmittedSchema,
  "expert.application.approved": expertApplicationApprovedSchema,
  "expert.application.rejected": expertApplicationRejectedSchema,
} as const;
