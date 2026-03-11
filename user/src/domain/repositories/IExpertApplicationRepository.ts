import { ExpertApplication } from "../entities/ExpertApplication";
import { TransactionContext } from "../../types/TransactionContext";
import { IBaseRepository } from "./IBaseRepository";

export interface IExpertApplicationRepository extends IBaseRepository<ExpertApplication> {
  findPendingByEmail(
    email: string,
    tx?: TransactionContext,
  ): Promise<ExpertApplication | null>;
}
