import { Workshop } from "../../domain/entities/Workshop";
import type { IWorkshopRepository } from "../../domain/repositories/IWorkshopRepository";
import type { IStorageService } from "../ports/IStorageService";
import {
  ForbiddenOperationError,
  NotFoundError,
  WorkshopAlreadyPublishedError,
  WorkshopDraftRequiredError,
  WorkshopNotReadyToPublishError,
} from "../../domain/errors";
import type {
  CreateWorkshopDTO,
  PublishWorkshopParamsDTO,
  ReplaceWorkshopSessionsBodyDTO,
  UpdateWorkshopBodyDTO,
  UpdateWorkshopSessionBodyDTO,
  WorkshopResponseDTO,
  WorkshopSessionResponseDTO,
} from "../dtos/workshop.dto";
import type { IWorkshopService } from "../interfaces/IWorkshopService";

export class WorkshopService implements IWorkshopService {
  constructor(
    private workshopRepo: IWorkshopRepository,
    private storageService: IStorageService,
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
    // const workshop = await this.workshopRepo.getById(id);
    const workshop = await this.getOwnedDraftWorkshop(id, expertId, "publish");

    if (workshop.status === "published") {
      throw new WorkshopAlreadyPublishedError();
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

    const savedWorkshop = await this.workshopRepo.update(workshop.publish());
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
