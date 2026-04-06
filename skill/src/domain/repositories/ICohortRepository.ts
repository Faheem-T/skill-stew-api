import type { Cohort } from "../entities/Cohort";
import type { TransactionContext } from "../../types/TransactionContext";

export interface ICohortRepository {
  create(cohort: Cohort, tx?: TransactionContext): Promise<Cohort>;
  getById(id: string, tx?: TransactionContext): Promise<Cohort>;
  getByIds(ids: string[], tx?: TransactionContext): Promise<Cohort[]>;
  findByWorkshopId(workshopId: string, tx?: TransactionContext): Promise<Cohort[]>;
  findByExpertId(
    expertId: string,
    workshopId?: string,
    tx?: TransactionContext,
  ): Promise<Cohort[]>;
  existsByWorkshopId(workshopId: string, tx?: TransactionContext): Promise<boolean>;
  findOverlappingByWorkshopId(
    workshopId: string,
    firstSessionStartsAt: Date,
    lastSessionStartsAt: Date,
    excludeCohortId?: string,
    tx?: TransactionContext,
  ): Promise<Cohort | null>;
  update(cohort: Cohort, tx?: TransactionContext): Promise<Cohort>;
  delete(id: string, tx?: TransactionContext): Promise<void>;
}
