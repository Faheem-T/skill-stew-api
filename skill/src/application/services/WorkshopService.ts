import type { EventName } from "@skillstew/common";
import { v7 as uuidv7 } from "uuid";
import { OutboxEvent } from "../../domain/entities/OutboxEvent";
import { Workshop } from "../../domain/entities/Workshop";
import type { IWorkshopRepository } from "../../domain/repositories/IWorkshopRepository";
import type { IOutboxEventRepository } from "../../domain/repositories/IOutboxEventRepository";
import type { IStorageService } from "../ports/IStorageService";
import type { IUnitOfWork } from "../ports/IUnitOfWork";
import {
  ForbiddenOperationError,
  NotFoundError,
  WorkshopAlreadyPublishedError,
  WorkshopDraftRequiredError,
  WorkshopNotReadyToPublishError,
} from "../../domain/errors";
import type {
  CreateWorkshopDTO,
  GetWorkshopsQueryDTO,
  PublishWorkshopParamsDTO,
  ReplaceWorkshopSessionsBodyDTO,
  UpdateWorkshopBodyDTO,
  UpdateWorkshopSessionBodyDTO,
  WorkshopResponseDTO,
  WorkshopSessionResponseDTO,
  WorkshopSummaryResponseDTO,
} from "../dtos/workshop.dto";
import type { IWorkshopService } from "../interfaces/IWorkshopService";

export class WorkshopService implements IWorkshopService {
  constructor(
    private workshopRepo: IWorkshopRepository,
    private storageService: IStorageService,
    private outboxEventRepo: IOutboxEventRepository,
    private unitOfWork: IUnitOfWork,
  ) {}

  createWorkshop = async ({
    expertId,
    title,
    description,
    targetAudience,
    maxCohortSize,
    bannerImageKey,
  }: CreateWorkshopDTO): Promise<WorkshopResponseDTO> => {
    const workshop = new Workshop({
      expertId,
      title,
      description,
      targetAudience,
      maxCohortSize,
      bannerImageKey,
      status: "draft",
      sessions: [],
      timezone: null,
    });

    const savedWorkshop = await this.workshopRepo.create(workshop);

    return {
      ...this.toResponse(savedWorkshop),
    };
  };

  getWorkshops = async ({
    expertId,
    status,
  }: GetWorkshopsQueryDTO): Promise<WorkshopSummaryResponseDTO[]> => {
    const workshops = await this.workshopRepo.findByExpertId(expertId, status);
    return workshops.map((workshop) => this.toSummaryResponse(workshop));
  };

  getWorkshopById = async (
    workshopId: string,
    expertId: string,
  ): Promise<WorkshopResponseDTO> => {
    const workshop = await this.workshopRepo.getById(workshopId);

    if (workshop.expertId !== expertId) {
      throw new ForbiddenOperationError(
        "You do not have permission to access this workshop.",
      );
    }

    return this.toResponse(workshop);
  };

  updateWorkshop = async (
    workshopId: string,
    expertId: string,
    data: UpdateWorkshopBodyDTO,
  ): Promise<WorkshopResponseDTO> => {
    const existingWorkshop = await this.getOwnedDraftWorkshop(
      workshopId,
      expertId,
      "update",
    );

    const updatedWorkshop = existingWorkshop.updateBasics(data);
    const savedWorkshop = await this.workshopRepo.update(updatedWorkshop);

    return this.toResponse(savedWorkshop);
  };

  replaceWorkshopSessions = async (
    workshopId: string,
    expertId: string,
    data: ReplaceWorkshopSessionsBodyDTO,
  ): Promise<WorkshopSessionResponseDTO[]> => {
    const workshop = await this.getOwnedDraftWorkshop(
      workshopId,
      expertId,
      "update",
    );

    const updatedWorkshop = workshop.replaceSchedule({
      timezone: data.timezone,
      sessions: data.sessions,
    });
    const savedWorkshop = await this.workshopRepo.update(updatedWorkshop);

    return savedWorkshop.sessions.map((session) =>
      this.toSessionResponse(session),
    );
  };

  updateWorkshopSession = async (
    workshopId: string,
    sessionId: string,
    expertId: string,
    data: UpdateWorkshopSessionBodyDTO,
  ): Promise<WorkshopSessionResponseDTO> => {
    const workshop = await this.getOwnedDraftWorkshop(
      workshopId,
      expertId,
      "update",
    );

    const existingSession = workshop.sessions.find(
      (session) => session.id === sessionId,
    );

    if (!existingSession) {
      throw new NotFoundError("Workshop session");
    }

    const updatedWorkshop = workshop.updateSession(sessionId, data);
    const savedWorkshop = await this.workshopRepo.update(updatedWorkshop);
    const updatedSession = savedWorkshop.sessions.find(
      (session) => session.id === sessionId,
    );

    if (!updatedSession) {
      throw new NotFoundError("Workshop session");
    }

    return this.toSessionResponse(updatedSession);
  };

  publishWorkshop = async ({
    id,
    expertId,
  }: PublishWorkshopParamsDTO): Promise<WorkshopResponseDTO> => {
    const workshop = await this.workshopRepo.getById(id);

    if (workshop.expertId !== expertId) {
      throw new ForbiddenOperationError(
        "You do not have permission to publish this workshop.",
      );
    }

    if (workshop.status === "published") {
      throw new WorkshopAlreadyPublishedError();
    }

    if (workshop.status !== "draft") {
      throw new WorkshopDraftRequiredError();
    }

    const validationErrors: Array<{ message: string; field?: string }> = [];

    if (!workshop.title.trim()) {
      validationErrors.push({
        message: "Workshop title is required before publishing.",
        field: "title",
      });
    }

    if (!workshop.maxCohortSize) {
      validationErrors.push({
        message: "Max cohort size is required before publishing.",
        field: "maxCohortSize",
      });
    }

    if (!workshop.timezone) {
      validationErrors.push({
        message: "Workshop timezone is required before publishing.",
        field: "timezone",
      });
    }

    if (workshop.sessions.length === 0) {
      validationErrors.push({
        message: "At least one session is required before publishing.",
        field: "sessions",
      });
    }

    const untitledSessionCount = workshop.sessions.filter(
      (session) => !session.title?.trim(),
    ).length;
    if (untitledSessionCount > 0) {
      validationErrors.push({
        message: `Session titles are missing for ${untitledSessionCount} session${untitledSessionCount === 1 ? "" : "s"}.`,
        field: "sessions",
      });
    }

    if (validationErrors.length > 0) {
      throw new WorkshopNotReadyToPublishError(validationErrors);
    }

    const publishedAt = new Date();
    const savedWorkshop = await this.unitOfWork.transact(async (tx) => {
      const publishedWorkshop = workshop.publish();
      const saved = await this.workshopRepo.update(publishedWorkshop, tx);

      const eventName = "workshop.published" as EventName;
      const payload = {
        id: saved.id,
        expertId: saved.expertId,
        title: saved.title,
        description: saved.description,
        targetAudience: saved.targetAudience,
        bannerImageKey: saved.bannerImageKey,
        publishedAt: publishedAt.toISOString(),
        sessionTitles: saved.sessions
          .map((session) => session.title)
          .filter((title): title is string => Boolean(title?.trim())),
        sessionDescriptions: saved.sessions
          .map((session) => session.description)
          .filter(
            (description): description is string => Boolean(description?.trim()),
          ),
      };

      await this.outboxEventRepo.create(
        new OutboxEvent(
          uuidv7(),
          eventName,
          payload,
          "PENDING",
          publishedAt,
          undefined,
        ),
        tx,
      );

      return saved;
    });
    return this.toResponse(savedWorkshop);
  };

  private getOwnedDraftWorkshop = async (
    workshopId: string,
    expertId: string,
    action: "update" | "publish",
  ): Promise<Workshop> => {
    const workshop = await this.workshopRepo.getById(workshopId);

    if (workshop.expertId !== expertId) {
      throw new ForbiddenOperationError(
        `You do not have permission to ${action} this workshop.`,
      );
    }

    if (workshop.status !== "draft") {
      throw new WorkshopDraftRequiredError();
    }

    return workshop;
  };

  private toResponse = (workshop: Workshop): WorkshopResponseDTO => {
    return {
      id: workshop.id,
      expertId: workshop.expertId,
      title: workshop.title,
      description: workshop.description,
      targetAudience: workshop.targetAudience,
      bannerImageKey: workshop.bannerImageKey,
      bannerImageUrl: workshop.bannerImageKey
        ? this.storageService.getPublicUrl(workshop.bannerImageKey)
        : null,
      maxCohortSize: workshop.maxCohortSize,
      status: workshop.status,
      sessions: workshop.sessions,
      timezone: workshop.timezone,
      createdAt: workshop.createdAt ?? new Date(),
      updatedAt: workshop.updatedAt ?? new Date(),
    };
  };

  private toSummaryResponse = (
    workshop: Workshop,
  ): WorkshopSummaryResponseDTO => {
    return {
      id: workshop.id,
      title: workshop.title,
      description: workshop.description,
      bannerImageKey: workshop.bannerImageKey,
      bannerImageUrl: workshop.bannerImageKey
        ? this.storageService.getPublicUrl(workshop.bannerImageKey)
        : null,
      status: workshop.status,
      timezone: workshop.timezone,
      updatedAt: workshop.updatedAt ?? new Date(),
      sessionCount: workshop.sessions.length,
    };
  };

  private toSessionResponse = (
    session: Workshop["sessions"][number],
  ): WorkshopSessionResponseDTO => {
    return {
      id: session.id,
      weekNumber: session.weekNumber,
      dayOfWeek: session.dayOfWeek,
      sessionOrder: session.sessionOrder,
      title: session.title ?? null,
      description: session.description ?? null,
      startTime: session.startTime,
    };
  };
}
