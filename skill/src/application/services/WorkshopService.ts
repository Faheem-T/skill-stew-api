import { Workshop } from "../../domain/entities/Workshop";
import type { IWorkshopRepository } from "../../domain/repositories/IWorkshopRepository";
import {
  ForbiddenOperationError,
  WorkshopDraftRequiredError,
} from "../../domain/errors";
import type {
  CreateWorkshopDTO,
  UpdateWorkshopBodyDTO,
  WorkshopResponseDTO,
} from "../dtos/workshop.dto";
import type { IWorkshopService } from "../interfaces/IWorkshopService";

export class WorkshopService implements IWorkshopService {
  constructor(private workshopRepo: IWorkshopRepository) {}

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
    const existingWorkshop = await this.workshopRepo.getById(workshopId);

    if (existingWorkshop.expertId !== expertId) {
      throw new ForbiddenOperationError(
        "You do not have permission to update this workshop.",
      );
    }

    if (existingWorkshop.status !== "draft") {
      throw new WorkshopDraftRequiredError();
    }

    const updatedWorkshop = existingWorkshop.updateBasics(data);
    const savedWorkshop = await this.workshopRepo.update(updatedWorkshop);

    return this.toResponse(savedWorkshop);
  };

  private toResponse = (workshop: Workshop): WorkshopResponseDTO => {
    return {
      id: workshop.id,
      expertId: workshop.expertId,
      title: workshop.title,
      description: workshop.description,
      targetAudience: workshop.targetAudience,
      bannerImageKey: workshop.bannerImageKey,
      maxCohortSize: workshop.maxCohortSize,
      status: workshop.status,
      sessions: workshop.sessions,
      timezone: workshop.timezone,
      createdAt: workshop.createdAt ?? new Date(),
      updatedAt: workshop.updatedAt ?? new Date(),
    };
  };
}
