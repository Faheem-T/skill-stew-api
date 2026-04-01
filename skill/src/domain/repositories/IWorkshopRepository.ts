import type { Workshop } from "../entities/Workshop";
import type { TransactionContext } from "../../types/TransactionContext";

export interface IWorkshopRepository {
  create(workshop: Workshop, tx?: TransactionContext): Promise<Workshop>;
  getById(id: string, tx?: TransactionContext): Promise<Workshop>;
  findByExpertId(
    expertId: string,
    status?: Workshop["status"],
    tx?: TransactionContext,
  ): Promise<Workshop[]>;
  update(workshop: Workshop, tx?: TransactionContext): Promise<Workshop>;
}
