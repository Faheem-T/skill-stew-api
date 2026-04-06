import type { UpsertWorkshopDTO } from "../dtos/WorkshopDTO";

export interface IWorkshopService {
  upsert(dto: UpsertWorkshopDTO): Promise<void>;
}
