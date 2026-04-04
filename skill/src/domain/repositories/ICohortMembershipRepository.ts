import type { CohortMembership } from "../entities/CohortMembership";
import type { CohortMembershipStatus } from "../entities/CohortMembershipStatus.enum";
import type { TransactionContext } from "../../types/TransactionContext";

export interface ICohortMembershipRepository {
  create(
    membership: CohortMembership,
    tx?: TransactionContext,
  ): Promise<CohortMembership>;
  findByCohortIdAndStatus(
    cohortId: string,
    status: CohortMembershipStatus,
    tx?: TransactionContext,
  ): Promise<CohortMembership[]>;
  findByUserIdAndStatuses(
    userId: string,
    statuses: CohortMembershipStatus[],
    tx?: TransactionContext,
  ): Promise<CohortMembership[]>;
  countByCohortId(
    cohortId: string,
    tx?: TransactionContext,
  ): Promise<number>;
  countByCohortIdAndStatuses(
    cohortId: string,
    statuses: CohortMembershipStatus[],
    tx?: TransactionContext,
  ): Promise<number>;
}
