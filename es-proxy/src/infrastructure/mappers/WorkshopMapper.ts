import { Workshop } from "../../domain/entities/Workshop";
import type { WorkshopDoc } from "../database/repositories/WorkshopRepository";
import type { Mapper } from "./interfaces/Mapper";

export class WorkshopMapper implements Mapper<Workshop, WorkshopDoc> {
  toPersistence(entity: Workshop): WorkshopDoc {
    return { ...entity };
  }

  toDomain(raw: WorkshopDoc): Workshop {
    const workshop = new Workshop(raw.id);
    workshop.expertId = raw.expertId;
    workshop.title = raw.title;
    workshop.description = raw.description;
    workshop.targetAudience = raw.targetAudience;
    workshop.bannerImageKey = raw.bannerImageKey;
    workshop.publishedAt = raw.publishedAt;
    workshop.sessionTitles = raw.sessionTitles;
    workshop.sessionDescriptions = raw.sessionDescriptions;
    return workshop;
  }

  toPersistencePartial(partial: Partial<Workshop>): Partial<WorkshopDoc> {
    return { ...partial };
  }
}
