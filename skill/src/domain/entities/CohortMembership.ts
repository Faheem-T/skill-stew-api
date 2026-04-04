import { v7 as uuidv7 } from "uuid";
import type { CohortMembershipStatus } from "./CohortMembershipStatus.enum";

export class CohortMembership {
  readonly id: string;
  readonly cohortId: string;
  readonly userId: string;
  readonly paymentId: string | null;
  readonly status: CohortMembershipStatus;
  readonly joinedAt: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor({
    id,
    cohortId,
    userId,
    paymentId,
    status,
    joinedAt,
    createdAt,
    updatedAt,
  }: {
    id?: string;
    cohortId: string;
    userId: string;
    paymentId?: string | null;
    status: CohortMembershipStatus;
    joinedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id ?? uuidv7();
    this.cohortId = cohortId;
    this.userId = userId;
    this.paymentId = paymentId ?? null;
    this.status = status;
    this.joinedAt = joinedAt ?? null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
