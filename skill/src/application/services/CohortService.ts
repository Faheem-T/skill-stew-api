import { Cohort } from "../../domain/entities/Cohort";
import { CohortMembership } from "../../domain/entities/CohortMembership";
import type { CohortMembershipStatus } from "../../domain/entities/CohortMembershipStatus.enum";
import type { Workshop } from "../../domain/entities/Workshop";
import type { ICohortRepository } from "../../domain/repositories/ICohortRepository";
import type { ICohortMembershipRepository } from "../../domain/repositories/ICohortMembershipRepository";
import type { IWorkshopRepository } from "../../domain/repositories/IWorkshopRepository";
import type { IStorageService } from "../ports/IStorageService";
import type { IUnitOfWork } from "../ports/IUnitOfWork";
import type { IPaymentsClient } from "../ports/IPaymentsClient";
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
  PublicCohortParamsDTO,
  PublicCohortResponseDTO,
  PublicEnrollmentContextDTO,
  PublicWorkshopParamsDTO,
  PublicWorkshopResponseDTO,
  UpdateCohortBodyDTO,
} from "../dtos/cohort.dto";

const LIVE_MEMBERSHIP_STATUSES: CohortMembershipStatus[] = [
  "active",
  "pending_payment",
  "awaiting_reconciliation",
];

const HELD_SEAT_STATUSES: CohortMembershipStatus[] = [
  "active",
  "pending_payment",
];

const RESERVATION_TTL_MS = 10 * 60 * 1000;

export class CohortService implements ICohortService {
  constructor(
    private cohortRepo: ICohortRepository,
    private cohortMembershipRepo: ICohortMembershipRepository,
    private workshopRepo: IWorkshopRepository,
    private storageService: IStorageService,
    private unitOfWork: IUnitOfWork,
    private paymentsClient: IPaymentsClient,
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
        const counts = await this.getSeatCounts(cohort.id);
        return this.toSummaryResponse(
          cohort,
          counts.activeSeats,
          counts.heldSeats,
        );
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
    const counts = await this.getSeatCounts(cohort.id);

    return this.toResponse(
      cohort,
      workshop,
      counts.activeSeats,
      counts.heldSeats,
    );
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
        const counts = await this.getSeatCounts(cohort.id);
        if (data.maxStudents < counts.heldSeats) {
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
    const counts = await this.getSeatCounts(saved.id);

    return this.toResponse(
      saved,
      workshop,
      counts.activeSeats,
      counts.heldSeats,
    );
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

  getPublicWorkshopById = async ({
    id,
    userId,
  }: PublicWorkshopParamsDTO): Promise<PublicWorkshopResponseDTO> => {
    const workshop = await this.workshopRepo.getById(id);
    if (workshop.status !== "published") {
      throw new ConflictError("This workshop is not publicly available.");
    }

    const allCohorts = await this.cohortRepo.findByWorkshopId(id);
    const upcomingCohorts = allCohorts.filter(
      (cohort) =>
        getDerivedCohortStatus({
          firstSessionStartsAt: cohort.firstSessionStartsAt,
          lastSessionStartsAt: cohort.lastSessionStartsAt,
        }) === "upcoming",
    );

    const userMemberships = userId
      ? await this.cohortMembershipRepo.findByUserIdAndCohortIds(
          userId,
          allCohorts.map((cohort) => cohort.id),
        )
      : [];
    const myWorkshopEnrollment =
      this.pickBestMembership(userMemberships) ?? null;

    const cohorts = await Promise.all(
      upcomingCohorts.map(async (cohort) => {
        const counts = await this.getSeatCounts(cohort.id);
        const sameCohortMembership = userId
          ? this.pickBestMembership(
              userMemberships.filter(
                (membership) => membership.cohortId === cohort.id,
              ),
            )
          : null;
        const anotherCohortMembership = Boolean(
          userId &&
          userMemberships.find(
            (membership) => membership.cohortId !== cohort.id,
          ),
        );

        return {
          ...this.toSummaryResponse(
            cohort,
            counts.activeSeats,
            counts.heldSeats,
          ),
          isEnrollable: this.isCohortEnrollable(cohort, counts.heldSeats),
          myEnrollment: sameCohortMembership
            ? this.toPublicEnrollmentContext(sameCohortMembership)
            : null,
          hasEnrollmentInAnotherCohort: anotherCohortMembership,
        };
      }),
    );

    return {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description,
      targetAudience: workshop.targetAudience,
      bannerImageKey: workshop.bannerImageKey,
      bannerImageUrl: workshop.bannerImageKey
        ? this.storageService.getPublicUrl(workshop.bannerImageKey)
        : null,
      timezone: workshop.timezone,
      sessions: workshop.sessions.map((session) => ({
        id: session.id,
        weekNumber: session.weekNumber,
        dayOfWeek: session.dayOfWeek,
        sessionOrder: session.sessionOrder,
        title: session.title ?? null,
        description: session.description ?? null,
        startTime: session.startTime,
      })),
      myEnrollment: myWorkshopEnrollment
        ? this.toPublicEnrollmentContext(myWorkshopEnrollment)
        : null,
      cohorts,
    };
  };

  getPublicCohortById = async ({
    id,
    userId,
  }: PublicCohortParamsDTO): Promise<PublicCohortResponseDTO> => {
    const cohort = await this.cohortRepo.getById(id);
    const status = getDerivedCohortStatus({
      firstSessionStartsAt: cohort.firstSessionStartsAt,
      lastSessionStartsAt: cohort.lastSessionStartsAt,
    });
    if (!["upcoming", "active"].includes(status)) {
      throw new ConflictError("This cohort is not publicly available.");
    }

    const workshop = await this.workshopRepo.getById(cohort.workshopId);
    if (workshop.status !== "published") {
      throw new ConflictError("This workshop is not publicly available.");
    }

    const counts = await this.getSeatCounts(cohort.id);
    const allWorkshopCohorts = userId
      ? await this.cohortRepo.findByWorkshopId(cohort.workshopId)
      : [];
    const userMemberships = userId
      ? await this.cohortMembershipRepo.findByUserIdAndCohortIds(
          userId,
          allWorkshopCohorts.map((entry) => entry.id),
        )
      : [];
    const sameCohortMembership = this.pickBestMembership(
      userMemberships.filter((membership) => membership.cohortId === cohort.id),
    );
    const hasEnrollmentInAnotherCohort = Boolean(
      userMemberships.find((membership) => membership.cohortId !== cohort.id),
    );

    return {
      ...this.toResponse(
        cohort,
        workshop,
        counts.activeSeats,
        counts.heldSeats,
      ),
      isEnrollable: this.isCohortEnrollable(cohort, counts.heldSeats),
      myEnrollment: sameCohortMembership
        ? this.toPublicEnrollmentContext(sameCohortMembership)
        : null,
      hasEnrollmentInAnotherCohort,
    };
  };

  enrollInCohort = async (
    cohortId: string,
    userId: string,
  ): Promise<CohortEnrollmentResponseDTO> => {
    return this.unitOfWork.transact(async (tx) => {
      const cohort = await this.cohortRepo.getById(cohortId, tx);
      if (cohort.expertId === userId) {
        throw new ConflictError("You cannot enroll in your own cohort.");
      }

      await this.expireStalePendingMemberships(userId, tx);
      await this.expireStalePendingMembershipsForCohort(cohort.id, tx);

      const status = getDerivedCohortStatus({
        firstSessionStartsAt: cohort.firstSessionStartsAt,
        lastSessionStartsAt: cohort.lastSessionStartsAt,
      });

      if (status !== "upcoming") {
        throw new ConflictError(
          "Only upcoming cohorts can accept enrollments.",
        );
      }

      const liveMemberships =
        await this.cohortMembershipRepo.findByUserIdAndStatuses(
          userId,
          LIVE_MEMBERSHIP_STATUSES,
          tx,
        );
      const blockingCohorts = await this.cohortRepo.getByIds(
        liveMemberships.map((membership) => membership.cohortId),
        tx,
      );
      const sameWorkshopEntries = blockingCohorts.filter(
        (entry) => entry.workshopId === cohort.workshopId,
      );
      const sameCohortEntry = sameWorkshopEntries.find(
        (entry) => entry.id === cohort.id,
      );

      const workshop = await this.workshopRepo.getById(cohort.workshopId, tx);

      if (sameCohortEntry) {
        const sameMembership = liveMemberships.find(
          (membership) => membership.cohortId === sameCohortEntry.id,
        );
        if (sameMembership?.status === "pending_payment") {
          const checkout = await this.paymentsClient.createCheckoutSession({
            membershipId: sameMembership.id,
            cohortId: cohort.id,
            workshopId: cohort.workshopId,
            workshopTitle: workshop.title,
            expertId: cohort.expertId,
            userId,
            amount: cohort.spotPriceAmount,
            currency: cohort.currency,
          });
          return this.toEnrollmentResponse(sameMembership, checkout);
        }
        if (sameMembership?.status === "active") {
          throw new ConflictError(
            "You already have an active enrollment for this cohort.",
          );
        }
        if (sameMembership?.status === "awaiting_reconciliation") {
          throw new ConflictError(
            "This enrollment requires reconciliation before you can try again.",
          );
        }
      }

      const differentCohortConflict = sameWorkshopEntries.find(
        (entry) => entry.id !== cohort.id,
      );
      if (differentCohortConflict) {
        throw new ConflictError(
          "You already have a live enrollment for another cohort of this workshop.",
        );
      }

      const counts = await this.getSeatCounts(cohort.id, tx);
      if (counts.heldSeats >= cohort.maxStudents) {
        throw new ConflictError("This cohort is sold out.");
      }

      if (cohort.spotPriceAmount === 0) {
        const membership = new CohortMembership({
          cohortId: cohort.id,
          userId,
          status: "active",
          joinedAt: new Date(),
        });
        const saved = await this.cohortMembershipRepo.create(membership, tx);
        return this.toEnrollmentResponse(saved);
      }

      const reservation = new CohortMembership({
        cohortId: cohort.id,
        userId,
        status: "pending_payment",
        expiresAt: new Date(Date.now() + RESERVATION_TTL_MS),
      });
      const savedReservation = await this.cohortMembershipRepo.create(
        reservation,
        tx,
      );
      const checkout = await this.paymentsClient.createCheckoutSession({
        membershipId: savedReservation.id,
        cohortId: cohort.id,
        workshopId: cohort.workshopId,
        workshopTitle: workshop.title,
        expertId: cohort.expertId,
        userId,
        amount: cohort.spotPriceAmount,
        currency: cohort.currency,
      });
      const updatedReservation = await this.cohortMembershipRepo.update(
        savedReservation.update({ paymentId: checkout.paymentId }),
        tx,
      );

      return this.toEnrollmentResponse(updatedReservation, checkout);
    });
  };

  handlePaymentSucceeded = async ({
    membershipId,
    paymentId,
    occurredAt,
  }: {
    membershipId: string;
    paymentId: string;
    occurredAt: string;
  }): Promise<void> => {
    await this.unitOfWork.transact(async (tx) => {
      const membership = await this.cohortMembershipRepo.getById(
        membershipId,
        tx,
      );

      if (membership.status === "active") {
        if (membership.paymentId === paymentId) {
          return;
        }
        await this.cohortMembershipRepo.update(
          membership.update({
            status: "awaiting_reconciliation",
            lastPaymentEventAt: new Date(occurredAt),
          }),
          tx,
        );
        return;
      }

      if (membership.status !== "pending_payment") {
        await this.cohortMembershipRepo.update(
          membership.update({
            status: "awaiting_reconciliation",
            paymentId,
            lastPaymentEventAt: new Date(occurredAt),
          }),
          tx,
        );
        return;
      }

      if (membership.expiresAt && membership.expiresAt <= new Date()) {
        await this.cohortMembershipRepo.update(
          membership.update({
            status: "awaiting_reconciliation",
            paymentId,
            lastPaymentEventAt: new Date(occurredAt),
          }),
          tx,
        );
        return;
      }

      const cohort = await this.cohortRepo.getById(membership.cohortId, tx);
      const status = getDerivedCohortStatus({
        firstSessionStartsAt: cohort.firstSessionStartsAt,
        lastSessionStartsAt: cohort.lastSessionStartsAt,
      });
      if (status !== "upcoming") {
        await this.cohortMembershipRepo.update(
          membership.update({
            status: "awaiting_reconciliation",
            paymentId,
            lastPaymentEventAt: new Date(occurredAt),
          }),
          tx,
        );
        return;
      }

      const heldSeats = await this.getHeldSeats(cohort.id, tx);
      if (heldSeats > cohort.maxStudents) {
        await this.cohortMembershipRepo.update(
          membership.update({
            status: "awaiting_reconciliation",
            paymentId,
            lastPaymentEventAt: new Date(occurredAt),
          }),
          tx,
        );
        return;
      }

      await this.cohortMembershipRepo.update(
        membership.update({
          status: "active",
          paymentId,
          expiresAt: null,
          joinedAt: new Date(occurredAt),
          lastPaymentEventAt: new Date(occurredAt),
        }),
        tx,
      );
    });
  };

  handlePaymentFailed = async ({
    membershipId,
    paymentId,
    occurredAt,
  }: {
    membershipId: string;
    paymentId: string;
    occurredAt: string;
  }): Promise<void> => {
    await this.applyPaymentOutcome({
      membershipId,
      paymentId,
      occurredAt,
      targetStatus: "payment_failed",
    });
  };

  handlePaymentRefunded = async ({
    membershipId,
    paymentId,
    occurredAt,
  }: {
    membershipId: string;
    paymentId: string;
    occurredAt: string;
  }): Promise<void> => {
    await this.applyPaymentOutcome({
      membershipId,
      paymentId,
      occurredAt,
      targetStatus: "refunded",
    });
  };

  private applyPaymentOutcome = async ({
    membershipId,
    paymentId,
    occurredAt,
    targetStatus,
  }: {
    membershipId: string;
    paymentId: string;
    occurredAt: string;
    targetStatus: "payment_failed" | "refunded";
  }) => {
    await this.unitOfWork.transact(async (tx) => {
      const membership = await this.cohortMembershipRepo.getById(
        membershipId,
        tx,
      );
      if (
        membership.status === targetStatus &&
        membership.paymentId === paymentId
      ) {
        return;
      }

      const isContradictory =
        (targetStatus === "payment_failed" && membership.status === "active") ||
        (targetStatus === "refunded" &&
          !["active", "refunded"].includes(membership.status));

      if (isContradictory) {
        await this.cohortMembershipRepo.update(
          membership.update({
            status: "awaiting_reconciliation",
            paymentId,
            lastPaymentEventAt: new Date(occurredAt),
          }),
          tx,
        );
        return;
      }

      await this.cohortMembershipRepo.update(
        membership.update({
          status: targetStatus,
          paymentId,
          expiresAt: null,
          lastPaymentEventAt: new Date(occurredAt),
        }),
        tx,
      );
    });
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
            ` Expected ${earliestSession.dayOfWeek}, got ${startDateWeekday}`,
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

  private async getSeatCounts(
    cohortId: string,
    tx?: Parameters<ICohortRepository["getById"]>[1],
  ) {
    const activeSeats =
      await this.cohortMembershipRepo.countByCohortIdAndStatuses(
        cohortId,
        ["active"],
        tx,
      );
    const pendingMemberships =
      await this.cohortMembershipRepo.findByCohortIdAndStatuses(
        cohortId,
        ["pending_payment"],
        tx,
      );
    const heldPending = pendingMemberships.filter(
      (membership) => membership.expiresAt && membership.expiresAt > new Date(),
    ).length;

    return {
      activeSeats,
      heldSeats: activeSeats + heldPending,
    };
  }

  private async getHeldSeats(
    cohortId: string,
    tx?: Parameters<ICohortRepository["getById"]>[1],
  ) {
    const counts = await this.getSeatCounts(cohortId, tx);
    return counts.heldSeats;
  }

  private isCohortEnrollable = (cohort: Cohort, heldSeats: number): boolean => {
    return (
      getDerivedCohortStatus({
        firstSessionStartsAt: cohort.firstSessionStartsAt,
        lastSessionStartsAt: cohort.lastSessionStartsAt,
      }) === "upcoming" && heldSeats < cohort.maxStudents
    );
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

  private toEnrollmentResponse(
    membership: CohortMembership,
    checkout?: {
      paymentId: string;
      checkoutSessionId: string;
      checkoutUrl: string;
    },
  ): CohortEnrollmentResponseDTO {
    return {
      membershipId: membership.id,
      status: membership.status,
      joinedAt: membership.joinedAt,
      expiresAt: membership.expiresAt,
      requiresPayment: membership.status === "pending_payment",
      paymentId: checkout?.paymentId ?? membership.paymentId,
      checkoutSessionId: checkout?.checkoutSessionId ?? null,
      checkoutUrl: checkout?.checkoutUrl ?? null,
    };
  }

  private pickBestMembership(
    memberships: CohortMembership[],
  ): CohortMembership | null {
    if (memberships.length === 0) {
      return null;
    }
    const priority: Record<CohortMembershipStatus, number> = {
      active: 7,
      pending_payment: 6,
      awaiting_reconciliation: 5,
      refunded: 4,
      dropped: 3,
      payment_failed: 2,
      expired: 1,
    };

    return [...memberships].sort((a, b) => {
      const priorityDiff = priority[b.status] - priority[a.status];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
    })[0]!;
  }

  private toPublicEnrollmentContext(
    membership: CohortMembership,
  ): PublicEnrollmentContextDTO {
    return {
      membershipId: membership.id,
      cohortId: membership.cohortId,
      status: membership.status,
    };
  }

  private async expireStalePendingMemberships(
    userId: string,
    tx?: Parameters<ICohortRepository["getById"]>[1],
  ) {
    const memberships = await this.cohortMembershipRepo.findByUserIdAndStatuses(
      userId,
      ["pending_payment"],
      tx,
    );
    await Promise.all(
      memberships
        .filter(
          (membership) =>
            membership.expiresAt && membership.expiresAt <= new Date(),
        )
        .map((membership) =>
          this.cohortMembershipRepo.update(
            membership.update({ status: "expired" }),
            tx,
          ),
        ),
    );
  }

  private async expireStalePendingMembershipsForCohort(
    cohortId: string,
    tx?: Parameters<ICohortRepository["getById"]>[1],
  ) {
    const memberships =
      await this.cohortMembershipRepo.findByCohortIdAndStatuses(
        cohortId,
        ["pending_payment"],
        tx,
      );
    await Promise.all(
      memberships
        .filter(
          (membership) =>
            membership.expiresAt && membership.expiresAt <= new Date(),
        )
        .map((membership) =>
          this.cohortMembershipRepo.update(
            membership.update({ status: "expired" }),
            tx,
          ),
        ),
    );
  }
}
