import { Workshop } from "../../domain/entities/Workshop";
import type { IWorkshopRepository } from "../../domain/repositories/IWorkshopRepository";
import type {
  CreateWorkshopDTO,
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
      id: savedWorkshop.id,
      expertId: savedWorkshop.expertId,
      title: savedWorkshop.title,
      description: savedWorkshop.description,
      targetAudience: savedWorkshop.targetAudience,
      bannerImageKey: savedWorkshop.bannerImageKey,
      maxCohortSize: savedWorkshop.maxCohortSize,
      status: savedWorkshop.status,
      sessions: savedWorkshop.sessions,
      timezone: savedWorkshop.timezone,
      createdAt: savedWorkshop.createdAt ?? new Date(),
      updatedAt: savedWorkshop.updatedAt ?? new Date(),
    };
  };
}
