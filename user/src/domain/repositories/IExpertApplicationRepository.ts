import { ExpertApplication } from "../entities/ExpertApplication";
import { ExpertApplicationStatus } from "../entities/ExpertApplicationStatus.enum";
import { TransactionContext } from "../../types/TransactionContext";
import { IBaseRepository } from "./IBaseRepository";

export type ExpertApplicationFilters = {
  status?: ExpertApplicationStatus;
};

export type FindAllExpertApplicationsInput = {
  limit: number;
  cursor?: string;
  filters?: ExpertApplicationFilters;
};

export type FindAllExpertApplicationsOutput = {
  applications: ExpertApplication[];
  hasNextPage: boolean;
  nextCursor: string | undefined;
};

export interface IExpertApplicationRepository extends IBaseRepository<ExpertApplication> {
  findAll(
    input: FindAllExpertApplicationsInput,
    tx?: TransactionContext,
  ): Promise<FindAllExpertApplicationsOutput>;
  findByExpertId(
    expertId: string,
    tx?: TransactionContext,
  ): Promise<ExpertApplication>;
}
