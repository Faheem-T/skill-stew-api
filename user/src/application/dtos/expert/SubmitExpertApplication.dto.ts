import z from "zod";
import { ExpertApplicationStatus } from "../../../domain/entities/ExpertApplicationStatus.enum";

export const submitExpertApplicationSchema = z.object({
  // Identity
  expertId: z.string().min(1, "Expert ID is required"),
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone number is required"),
  socialLinks: z.array(z.string().url("Must be a valid URL")),

  // Expertise
  yearsExperience: z.number().int().nonnegative(),
  evidenceLinks: z
    .array(z.string().url())
    .min(1, "At least one evidence link is required"),
  hasTeachingExperience: z.boolean(),
  teachingExperienceDesc: z.string().optional(),

  // Bio
  bio: z.string().min(1, "Bio is required"),

  // Workshop Intent
  proposedTitle: z.string().min(1, "Proposed title is required"),
  proposedDescription: z.string().min(1, "Proposed description is required"),
  targetAudience: z.string().min(1, "Target audience is required"),

  // Technical readiness
  confirmedInternet: z.literal(true, {
    errorMap: () => ({ message: "Internet confirmation is required" }),
  }),
  confirmedCamera: z.literal(true, {
    errorMap: () => ({ message: "Camera confirmation is required" }),
  }),
  confirmedMicrophone: z.literal(true, {
    errorMap: () => ({ message: "Microphone confirmation is required" }),
  }),

  // Legal
  termsAgreed: z.literal(true, {
    errorMap: () => ({ message: "Terms must be agreed to" }),
  }),
});

export type SubmitExpertApplicationDTO = z.infer<
  typeof submitExpertApplicationSchema
>;

export type SubmitExpertApplicationOutputDTO = {
  id: string;
  status: ExpertApplicationStatus;
  submittedAt: Date;
};
