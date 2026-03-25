import { TransactionContext } from "../../types/TransactionContext";
import { ExpertProfile } from "../entities/ExpertProfile";
import { IBaseRepository } from "./IBaseRepository";

export interface IExpertProfileRepository extends IBaseRepository<ExpertProfile> {
  findByExpertId(
    expertId: string,
    tx?: TransactionContext,
  ): Promise<ExpertProfile>;
}
