import type { UpsertWorkshopDTO } from "../dtos/WorkshopDTO";
import type { IWorkshopService } from "../interfaces/IWorkshopService";
import { Workshop } from "../../domain/entities/Workshop";
import type { IWorkshopRepository } from "../../domain/repositories/IWorkshopRepository";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ESIndexNotFoundError } from "../errors/infra";

export class WorkshopService implements IWorkshopService {
  constructor(private workshopRepo: IWorkshopRepository) {}

  upsert = async (dto: UpsertWorkshopDTO): Promise<void> => {
    const workshop = new Workshop(dto.id);
    workshop.expertId = dto.expertId;
    workshop.title = dto.title;
    workshop.description = dto.description;
    workshop.targetAudience = dto.targetAudience;
    workshop.bannerImageKey = dto.bannerImageKey;
    workshop.publishedAt = dto.publishedAt;
    workshop.sessionTitles = dto.sessionTitles;
    workshop.sessionDescriptions = dto.sessionDescriptions;

    try {
      await this.workshopRepo.findById(dto.id);
      await this.workshopRepo.update(dto.id, workshop);
    } catch (err) {
      if (err instanceof NotFoundError || err instanceof ESIndexNotFoundError) {
        await this.workshopRepo.create(dto.id, workshop);
        return;
      }
      throw err;
    }
  };
}
