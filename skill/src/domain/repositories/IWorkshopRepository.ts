import type { Workshop } from "../entities/Workshop";

export interface IWorkshopRepository {
  create(workshop: Workshop): Promise<Workshop>;
  getById(id: string): Promise<Workshop>;
  update(workshop: Workshop): Promise<Workshop>;
}
