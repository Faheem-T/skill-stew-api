import { Client } from "@elastic/elasticsearch";
import type { Workshop } from "../../../domain/entities/Workshop";
import type { IWorkshopRepository } from "../../../domain/repositories/IWorkshopRepository";
import { BaseRepository } from "./BaseRepository";
import { WorkshopMapper } from "../../mappers/WorkshopMapper";

export interface WorkshopDoc {
  id: string;
  expertId: string;
  title: string;
  description: string | null;
  targetAudience: string | null;
  bannerImageKey: string | null;
  publishedAt: string;
  sessionTitles: string[];
  sessionDescriptions: string[];
}

export class WorkshopRepository
  extends BaseRepository<Workshop, WorkshopDoc>
  implements IWorkshopRepository
{
  constructor(es: Client) {
    super("workshops", es);
  }

  protected mapper = new WorkshopMapper();

  protected getEntityName(): string {
    return "Workshop";
  }
}
