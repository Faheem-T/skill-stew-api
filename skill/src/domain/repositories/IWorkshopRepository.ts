import type { Workshop } from "../entities/Workshop";

export interface IWorkshopRepository {
  create(workshop: Workshop): Promise<Workshop>;
}
