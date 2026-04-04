import z from "zod";
import { CohortStatus } from "../../domain/entities/CohortStatus.enum";
import { CohortMembershipStatus } from "../../domain/entities/CohortMembershipStatus.enum";

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
const currencyCodeRegex = /^[A-Z]{3}$/;

const currencyCodeDTO = z
  .string()
  .trim()
  .min(1, "Currency is required")
  .transform((value) => value.toUpperCase())
  .refine(
    (value) => currencyCodeRegex.test(value),
    "Currency must be a valid 3-letter uppercase code",
  );

export const createCohortDTO = z.object({
  expertId: z.string().trim().min(1, "Expert ID is required"),
  workshopId: z.string().trim().min(1, "Workshop ID is required"),
  spotPriceAmount: z
    .number()
    .int("Spot price amount must be an integer")
    .min(0, "Spot price amount must be at least 0"),
  currency: currencyCodeDTO,
  startDate: z.string().regex(dateOnlyRegex, "Start date must be YYYY-MM-DD"),
  maxStudents: z
    .number()
    .int("Max students must be an integer")
    .positive("Max students must be greater than 0")
    .optional(),
});

export type CreateCohortDTO = z.infer<typeof createCohortDTO>;

export const getCohortsQueryDTO = z.object({
  expertId: z.string().trim().min(1, "Expert ID is required"),
  workshopId: z.string().trim().min(1, "Workshop ID is required").optional(),
  status: z.enum(CohortStatus).optional(),
});

export type GetCohortsQueryDTO = z.infer<typeof getCohortsQueryDTO>;

export const getCohortParamsDTO = z.object({
  id: z.string().trim().min(1, "Cohort ID is required"),
  expertId: z.string().trim().min(1, "Expert ID is required"),
});

export type GetCohortParamsDTO = z.infer<typeof getCohortParamsDTO>;

export const updateCohortParamsDTO = getCohortParamsDTO;
export type UpdateCohortParamsDTO = z.infer<typeof updateCohortParamsDTO>;

export const updateCohortBodyDTO = z
  .object({
    spotPriceAmount: z
      .number()
      .int("Spot price amount must be an integer")
      .min(0, "Spot price amount must be at least 0")
      .optional(),
    currency: currencyCodeDTO.optional(),
    startDate: z
      .string()
      .regex(dateOnlyRegex, "Start date must be YYYY-MM-DD")
      .optional(),
    maxStudents: z
      .number()
      .int("Max students must be an integer")
      .positive("Max students must be greater than 0")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateCohortBodyDTO = z.infer<typeof updateCohortBodyDTO>;

export const cohortDerivedSessionResponseDTO = z.object({
  id: z.string(),
  weekNumber: z.number(),
  dayOfWeek: z.number(),
  sessionOrder: z.number(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  startTime: z.string(),
  date: z.string(),
  startsAt: z.date(),
});

export type CohortDerivedSessionResponseDTO = z.infer<
  typeof cohortDerivedSessionResponseDTO
>;

export const cohortSummaryResponseDTO = z.object({
  id: z.string(),
  workshopId: z.string(),
  workshopTitle: z.string(),
  workshopBannerImageKey: z.string().nullable(),
  workshopBannerImageUrl: z.string().nullable(),
  spotPriceAmount: z.number(),
  currency: z.string(),
  startDate: z.string(),
  firstSessionStartsAt: z.date(),
  lastSessionStartsAt: z.date(),
  status: z.enum(CohortStatus),
  maxStudents: z.number(),
  activeSeats: z.number(),
  heldSeats: z.number(),
  availableSeats: z.number(),
});

export type CohortSummaryResponseDTO = z.infer<typeof cohortSummaryResponseDTO>;

export const cohortResponseDTO = cohortSummaryResponseDTO.extend({
  expertId: z.string(),
  workshopTimezone: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  sessions: z.array(cohortDerivedSessionResponseDTO),
});

export type CohortResponseDTO = z.infer<typeof cohortResponseDTO>;

export const cohortMemberResponseDTO = z.object({
  membershipId: z.string(),
  userId: z.string(),
  paymentId: z.string().nullable(),
  joinedAt: z.date().nullable(),
});

export type CohortMemberResponseDTO = z.infer<typeof cohortMemberResponseDTO>;

export const enrollInCohortParamsDTO = z.object({
  id: z.string().trim().min(1, "Cohort ID is required"),
  userId: z.string().trim().min(1, "User ID is required"),
});

export type EnrollInCohortParamsDTO = z.infer<typeof enrollInCohortParamsDTO>;

export const cohortEnrollmentResponseDTO = z.object({
  membershipId: z.string(),
  status: z.enum(CohortMembershipStatus),
  joinedAt: z.date().nullable(),
  expiresAt: z.date().nullable(),
  requiresPayment: z.boolean(),
});

export type CohortEnrollmentResponseDTO = z.infer<
  typeof cohortEnrollmentResponseDTO
>;
