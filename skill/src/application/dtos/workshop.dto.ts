import z from "zod";
import { WorkshopStatus } from "../../domain/entities/WorkshopStatus.enum.ts";

const optionalNullableString = z.string().trim().min(1).nullable().optional();
const timeStringRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const isValidTimeZone = (timeZone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
};

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

export const workshopSessionResponseDTO = z.object({
  id: z.string(),
  weekNumber: z.number(),
  dayOfWeek: z.number(),
  sessionOrder: z.number(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  startTime: z.string(),
});

export type WorkshopSessionResponseDTO = z.infer<
  typeof workshopSessionResponseDTO
>;

const scheduleSessionInputDTO = z.object({
  weekNumber: z
    .number()
    .int("Week number must be an integer")
    .min(1, "Week number must be at least 1"),
  dayOfWeek: z
    .number()
    .int("Day of week must be an integer")
    .min(0, "Day of week must be between 0 and 6")
    .max(6, "Day of week must be between 0 and 6"),
  sessionOrder: z
    .number()
    .int("Session order must be an integer")
    .min(1, "Session order must be at least 1"),
  startTime: z.string().regex(timeStringRegex, "Start time must be HH:mm"),
});

export const replaceWorkshopSessionsParamsDTO = z.object({
  id: z.string().trim().min(1, "Workshop ID is required"),
  expertId: z.string().trim().min(1, "Expert ID is required"),
});

export type ReplaceWorkshopSessionsParamsDTO = z.infer<
  typeof replaceWorkshopSessionsParamsDTO
>;

export const replaceWorkshopSessionsBodyDTO = z
  .object({
    timezone: z
      .string()
      .trim()
      .min(1, "Timezone is required")
      .refine(isValidTimeZone, "Timezone must be a valid IANA timezone"),
    sessions: z.array(scheduleSessionInputDTO),
  })
  .superRefine((data, ctx) => {
    const seen = new Set<string>();

    data.sessions.forEach((session, index) => {
      const key = `${session.weekNumber}:${session.dayOfWeek}:${session.sessionOrder}`;
      if (seen.has(key)) {
        ctx.addIssue({
          code: "custom",
          message:
            "Duplicate session slot for weekNumber/dayOfWeek/sessionOrder",
          path: ["sessions", index],
        });
      }
      seen.add(key);
    });
  });

export type ReplaceWorkshopSessionsBodyDTO = z.infer<
  typeof replaceWorkshopSessionsBodyDTO
>;

export const updateWorkshopSessionParamsDTO = z.object({
  id: z.string().trim().min(1, "Workshop ID is required"),
  sessionId: z.string().trim().min(1, "Session ID is required"),
  expertId: z.string().trim().min(1, "Expert ID is required"),
});

export type UpdateWorkshopSessionParamsDTO = z.infer<
  typeof updateWorkshopSessionParamsDTO
>;

export const updateWorkshopSessionBodyDTO = z
  .object({
    title: z.string().trim().min(1, "Title is required").optional(),
    description: optionalNullableString,
    startTime: z
      .string()
      .regex(timeStringRegex, "Start time must be HH:mm")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateWorkshopSessionBodyDTO = z.infer<
  typeof updateWorkshopSessionBodyDTO
>;

export const publishWorkshopParamsDTO = z.object({
  id: z.string().trim().min(1, "Workshop ID is required"),
  expertId: z.string().trim().min(1, "Expert ID is required"),
});

export type PublishWorkshopParamsDTO = z.infer<typeof publishWorkshopParamsDTO>;

export const workshopResponseDTO = z.object({
  id: z.string(),
  expertId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  targetAudience: z.string().nullable(),
  bannerImageKey: z.string().nullable(),
  bannerImageUrl: z.string().nullable(),
  maxCohortSize: z.number(),
  status: z.enum(WorkshopStatus),
  sessions: z.array(workshopSessionResponseDTO),
  timezone: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WorkshopResponseDTO = z.infer<typeof workshopResponseDTO>;
