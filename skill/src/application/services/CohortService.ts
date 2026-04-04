import { Cohort } from "../../domain/entities/Cohort";
import { CohortMembership } from "../../domain/entities/CohortMembership";
import type { Workshop } from "../../domain/entities/Workshop";
import type { ICohortRepository } from "../../domain/repositories/ICohortRepository";
import type { ICohortMembershipRepository } from "../../domain/repositories/ICohortMembershipRepository";
import type { IWorkshopRepository } from "../../domain/repositories/IWorkshopRepository";
import type { IStorageService } from "../ports/IStorageService";
import { ConflictError, ForbiddenOperationError } from "../../domain/errors";
import { ValidationError } from "../errors/ValidationError";
import {
  dateOnlyWeekday,
  deriveCohortSessions,
  deriveCohortWindow,
  getDerivedCohortStatus,
  getEarliestWorkshopSession,
} from "../../utils/cohortSchedule";
import type { ICohortService } from "../interfaces/ICohortService";
import type {
  CohortEnrollmentResponseDTO,
  CohortMemberResponseDTO,
  CohortResponseDTO,
  CohortSummaryResponseDTO,
  CreateCohortDTO,
  GetCohortParamsDTO,
  GetCohortsQueryDTO,
  UpdateCohortBodyDTO,
} from "../dtos/cohort.dto";

export class CohortService implements ICohortService {
  constructor(
    private cohortRepo: ICohortRepository,
    private cohortMembershipRepo: ICohortMembershipRepository,
    private workshopRepo: IWorkshopRepository,
    private storageService: IStorageService,
  ) {}

  createCohort = async ({
    expertId,
    workshopId,
    spotPriceAmount,
    currency,
    startDate,
    maxStudents,
  }: CreateCohortDTO): Promise<CohortResponseDTO> => {
    const workshop = await this.workshopRepo.getById(workshopId);
    this.assertCanManageWorkshop(workshop, expertId);
    this.assertWorkshopReadyForCohorts(workshop);

    const derived = this.deriveSchedule(workshop, startDate);
    await this.ensureNoOverlap(
      workshopId,
      derived.firstSessionStartsAt,
      derived.lastSessionStartsAt,
    );

    const cohort = new Cohort({
      workshopId,
      expertId,
      workshopTitle: workshop.title,
      workshopBannerImageKey: workshop.bannerImageKey,
      workshopTimezone: workshop.timezone!,
      spotPriceAmount,
      currency,
      startDate,
      maxStudents: maxStudents ?? workshop.maxCohortSize,
      firstSessionStartsAt: derived.firstSessionStartsAt,
      lastSessionStartsAt: derived.lastSessionStartsAt,
    });

    const savedCohort = await this.cohortRepo.create(cohort);
    return this.toResponse(savedCohort, workshop, 0, 0);
  };

  getCohorts = async ({
    expertId,
    workshopId,
    status,
  }: GetCohortsQueryDTO): Promise<CohortSummaryResponseDTO[]> => {
    const cohorts = await this.cohortRepo.findByExpertId(expertId, workshopId);
    const summaries = await Promise.all(
      cohorts.map(async (cohort) => {
        const activeSeats =
          await this.cohortMembershipRepo.countByCohortIdAndStatuses(
            cohort.id,
            ["active"],
          );
        const heldSeats = activeSeats;
        return this.toSummaryResponse(cohort, activeSeats, heldSeats);
      }),
    );

    return status
      ? summaries.filter((cohort) => cohort.status === status)
      : summaries;
  };

  getCohortById = async ({
    id,
    expertId,
  }: GetCohortParamsDTO): Promise<CohortResponseDTO> => {
    const cohort = await this.cohortRepo.getById(id);
    if (cohort.expertId !== expertId) {
      throw new ForbiddenOperationError(
        "You do not have permission to access this cohort.",
      );
    }

    const workshop = await this.workshopRepo.getById(cohort.workshopId);
    const activeSeats =
      await this.cohortMembershipRepo.countByCohortIdAndStatuses(cohort.id, [
        "active",
      ]);

    return this.toResponse(cohort, workshop, activeSeats, activeSeats);
  };

  updateCohort = async (
    cohortId: string,
    expertId: string,
    data: UpdateCohortBodyDTO,
  ): Promise<CohortResponseDTO> => {
    const cohort = await this.getOwnedCohort(cohortId, expertId);
    const workshop = await this.workshopRepo.getById(cohort.workshopId);
    const membershipCount = await this.cohortMembershipRepo.countByCohortId(
      cohort.id,
    );

    if (membershipCount > 0) {
      const disallowedFieldChanged =
        data.startDate !== undefined ||
        data.spotPriceAmount !== undefined ||
        data.currency !== undefined;

      if (disallowedFieldChanged) {
        throw new ConflictError(
          "Cohorts with memberships can only update max students.",
        );
      }

      if (data.maxStudents !== undefined) {
        const heldSeats =
          await this.cohortMembershipRepo.countByCohortIdAndStatuses(
            cohort.id,
            ["active"],
          );

        if (data.maxStudents < heldSeats) {
          throw new ConflictError(
            "Max students cannot be lower than currently held seats.",
          );
        }
      }
    }

    const updatedStartDate = data.startDate ?? cohort.startDate;
    const derived =
      data.startDate !== undefined
        ? this.deriveSchedule(workshop, updatedStartDate)
        : {
            firstSessionStartsAt: cohort.firstSessionStartsAt,
            lastSessionStartsAt: cohort.lastSessionStartsAt,
          };

    if (data.startDate !== undefined) {
      await this.ensureNoOverlap(
        cohort.workshopId,
        derived.firstSessionStartsAt,
        derived.lastSessionStartsAt,
        cohort.id,
      );
    }

    const updatedCohort = cohort.updateMutableFields({
      spotPriceAmount: data.spotPriceAmount,
      currency: data.currency,
      startDate: data.startDate,
      maxStudents: data.maxStudents,
      firstSessionStartsAt: derived.firstSessionStartsAt,
      lastSessionStartsAt: derived.lastSessionStartsAt,
    });

    const saved = await this.cohortRepo.update(updatedCohort);
    const activeSeats =
      await this.cohortMembershipRepo.countByCohortIdAndStatuses(saved.id, [
        "active",
      ]);

    return this.toResponse(saved, workshop, activeSeats, activeSeats);
  };

  deleteCohort = async (cohortId: string, expertId: string): Promise<void> => {
    const cohort = await this.getOwnedCohort(cohortId, expertId);
    const membershipCount = await this.cohortMembershipRepo.countByCohortId(
      cohort.id,
    );

    if (membershipCount > 0) {
      throw new ConflictError("Cohorts with memberships cannot be deleted.");
    }

    await this.cohortRepo.delete(cohort.id);
  };

  getCohortMembers = async (
    cohortId: string,
    expertId: string,
  ): Promise<CohortMemberResponseDTO[]> => {
    const cohort = await this.getOwnedCohort(cohortId, expertId);
    const members = await this.cohortMembershipRepo.findByCohortIdAndStatus(
      cohort.id,
      "active",
    );

    return members.map((member) => ({
      membershipId: member.id,
      userId: member.userId,
      paymentId: member.paymentId,
      joinedAt: member.joinedAt,
    }));
  };

  enrollInCohort = async (
    cohortId: string,
    userId: string,
  ): Promise<CohortEnrollmentResponseDTO> => {
    const cohort = await this.cohortRepo.getById(cohortId);
    if (cohort.expertId === userId) {
      throw new ConflictError("You cannot enroll in your own cohort.");
    }

    const status = getDerivedCohortStatus({
      firstSessionStartsAt: cohort.firstSessionStartsAt,
      lastSessionStartsAt: cohort.lastSessionStartsAt,
    });

    if (status !== "upcoming") {
      throw new ConflictError("Only upcoming cohorts can accept enrollments.");
    }

    const existingMemberships =
      await this.cohortMembershipRepo.findByUserIdAndStatuses(userId, [
        "active",
      ]);
    if (existingMemberships.length > 0) {
      const blockingCohorts = await this.cohortRepo.getByIds(
        existingMemberships.map((membership) => membership.cohortId),
      );
      const sameWorkshopMembership = blockingCohorts.find(
        (existingCohort) => existingCohort.workshopId === cohort.workshopId,
      );

      if (sameWorkshopMembership) {
        throw new ConflictError(
          "You already have an active enrollment for this workshop.",
        );
      }
    }

    const activeSeats =
      await this.cohortMembershipRepo.countByCohortIdAndStatuses(cohort.id, [
        "active",
      ]);
    if (activeSeats >= cohort.maxStudents) {
      throw new ConflictError("This cohort is sold out.");
    }

    if (cohort.spotPriceAmount > 0) {
      throw new ConflictError("Paid cohort enrollment is not available yet.");
    }

    const membership = new CohortMembership({
      cohortId: cohort.id,
      userId,
      status: "active",
      joinedAt: new Date(),
    });
    const savedMembership = await this.cohortMembershipRepo.create(membership);

    return {
      membershipId: savedMembership.id,
      status: savedMembership.status,
      joinedAt: savedMembership.joinedAt,
      expiresAt: null,
      requiresPayment: false,
    };
  };

  private getOwnedCohort = async (
    cohortId: string,
    expertId: string,
  ): Promise<Cohort> => {
    const cohort = await this.cohortRepo.getById(cohortId);
    if (cohort.expertId !== expertId) {
      throw new ForbiddenOperationError(
        "You do not have permission to access this cohort.",
      );
    }

    return cohort;
  };

  private assertCanManageWorkshop = (workshop: Workshop, expertId: string) => {
    if (workshop.expertId !== expertId) {
      throw new ForbiddenOperationError(
        "You do not have permission to manage cohorts for this workshop.",
      );
    }
  };

  private assertWorkshopReadyForCohorts = (workshop: Workshop) => {
    if (workshop.status !== "published") {
      throw new ConflictError(
        "Cohorts can only be created for published workshops.",
      );
    }

    if (!workshop.timezone) {
      throw new ConflictError(
        "Workshops must have a timezone before cohorts can be created.",
      );
    }

    if (workshop.sessions.length === 0) {
      throw new ConflictError(
        "Workshops must have at least one session before cohorts can be created.",
      );
    }

    const earliestSession = getEarliestWorkshopSession(workshop.sessions);
    if (earliestSession.weekNumber !== 1) {
      throw new ValidationError([
        {
          message: "The earliest workshop session must be in week 1.",
          field: "sessions",
        },
      ]);
    }
  };

  private deriveSchedule = (workshop: Workshop, startDate: string) => {
    const earliestSession = getEarliestWorkshopSession(workshop.sessions);
    const startDateWeekday = dateOnlyWeekday(startDate);

    if (startDateWeekday !== earliestSession.dayOfWeek) {
      throw new ValidationError([
        {
          message:
            "Start date must match the weekday of the earliest workshop session." +
            `Expected ${earliestSession.dayOfWeek}, got ${startDateWeekday}`,
          field: "startDate",
        },
      ]);
    }

    const sessions = deriveCohortSessions({
      sessions: workshop.sessions,
      startDate,
      timeZone: workshop.timezone!,
    });
    return {
      sessions,
      ...deriveCohortWindow(sessions),
    };
  };

  private ensureNoOverlap = async (
    workshopId: string,
    firstSessionStartsAt: Date,
    lastSessionStartsAt: Date,
    excludeCohortId?: string,
  ) => {
    const overlapping = await this.cohortRepo.findOverlappingByWorkshopId(
      workshopId,
      firstSessionStartsAt,
      lastSessionStartsAt,
      excludeCohortId,
    );

    if (overlapping) {
      throw new ConflictError(
        "This workshop already has an overlapping cohort in the selected date range.",
      );
    }
  };

  private toSummaryResponse = (
    cohort: Cohort,
    activeSeats: number,
    heldSeats: number,
  ): CohortSummaryResponseDTO => {
    return {
      id: cohort.id,
      workshopId: cohort.workshopId,
      workshopTitle: cohort.workshopTitle,
      workshopBannerImageKey: cohort.workshopBannerImageKey,
      workshopBannerImageUrl: cohort.workshopBannerImageKey
        ? this.storageService.getPublicUrl(cohort.workshopBannerImageKey)
        : null,
      spotPriceAmount: cohort.spotPriceAmount,
      currency: cohort.currency,
      startDate: cohort.startDate,
      firstSessionStartsAt: cohort.firstSessionStartsAt,
      lastSessionStartsAt: cohort.lastSessionStartsAt,
      status: getDerivedCohortStatus({
        firstSessionStartsAt: cohort.firstSessionStartsAt,
        lastSessionStartsAt: cohort.lastSessionStartsAt,
      }),
      maxStudents: cohort.maxStudents,
      activeSeats,
      heldSeats,
      availableSeats: Math.max(cohort.maxStudents - heldSeats, 0),
    };
  };

  private toResponse = (
    cohort: Cohort,
    workshop: Workshop,
    activeSeats: number,
    heldSeats: number,
  ): CohortResponseDTO => {
    const sessions = deriveCohortSessions({
      sessions: workshop.sessions,
      startDate: cohort.startDate,
      timeZone: cohort.workshopTimezone,
    });

    return {
      ...this.toSummaryResponse(cohort, activeSeats, heldSeats),
      expertId: cohort.expertId,
      workshopTimezone: cohort.workshopTimezone,
      createdAt: cohort.createdAt ?? new Date(),
      updatedAt: cohort.updatedAt ?? new Date(),
      sessions,
    };
  };
}
