import z from "zod";
import { WorkshopStatus } from "../../domain/entities/WorkshopStatus.enum.ts";

const optionalNullableString = z.string().trim().min(1).nullable().optional();

export const createWorkshopDTO = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: optionalNullableString,
  targetAudience: optionalNullableString,
  maxCohortSize: z
    .number()
    .int("Max cohort size must be an integer")
    .positive("Max cohort size must be greater than 0"),
  bannerImageKey: optionalNullableString,
  expertId: z.string().trim().min(1, "Expert ID is required"),
});

export type CreateWorkshopDTO = z.infer<typeof createWorkshopDTO>;

export const updateWorkshopParamsDTO = z.object({
  id: z.string().trim().min(1, "Workshop ID is required"),
  expertId: z.string().trim().min(1, "Expert ID is required"),
});

export type UpdateWorkshopParamsDTO = z.infer<typeof updateWorkshopParamsDTO>;

export const updateWorkshopBodyDTO = z
  .object({
    title: z.string().trim().min(1, "Title is required").optional(),
    description: optionalNullableString,
    targetAudience: optionalNullableString,
    maxCohortSize: z
      .number()
      .int("Max cohort size must be an integer")
      .positive("Max cohort size must be greater than 0")
      .optional(),
    bannerImageKey: optionalNullableString,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateWorkshopBodyDTO = z.infer<typeof updateWorkshopBodyDTO>;

export const workshopResponseDTO = z.object({
  id: z.string(),
  expertId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  targetAudience: z.string().nullable(),
  bannerImageKey: z.string().nullable(),
  maxCohortSize: z.number(),
  status: z.enum(WorkshopStatus),
  sessions: z.array(
    z.object({
      id: z.string(),
      weekNumber: z.number(),
      dayOfWeek: z.number(),
      sessionOrder: z.number(),
      title: z.string().nullable().optional(),
      description: z.string().nullable().optional(),
      startTime: z.string(),
    }),
  ),
  timezone: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkshopResponseDTO = z.infer<typeof workshopResponseDTO>;
