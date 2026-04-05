import { v7 as uuidv7 } from "uuid";
import type { CohortMembershipStatus } from "./CohortMembershipStatus.enum";

export class CohortMembership {
  readonly id: string;
  readonly cohortId: string;
  readonly userId: string;
  readonly paymentId: string | null;
  readonly status: CohortMembershipStatus;
  readonly joinedAt: Date | null;
  readonly expiresAt: Date | null;
  readonly lastPaymentEventAt: Date | null;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor({
    id,
    cohortId,
    userId,
    paymentId,
    status,
    joinedAt,
    expiresAt,
    lastPaymentEventAt,
    createdAt,
    updatedAt,
  }: {
    id?: string;
    cohortId: string;
    userId: string;
    paymentId?: string | null;
    status: CohortMembershipStatus;
    joinedAt?: Date | null;
    expiresAt?: Date | null;
    lastPaymentEventAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = id ?? uuidv7();
    this.cohortId = cohortId;
    this.userId = userId;
    this.paymentId = paymentId ?? null;
    this.status = status;
    this.joinedAt = joinedAt ?? null;
    this.expiresAt = expiresAt ?? null;
    this.lastPaymentEventAt = lastPaymentEventAt ?? null;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  update({
    paymentId,
    status,
    joinedAt,
    expiresAt,
    lastPaymentEventAt,
  }: {
    paymentId?: string | null;
    status?: CohortMembershipStatus;
    joinedAt?: Date | null;
    expiresAt?: Date | null;
    lastPaymentEventAt?: Date | null;
  }): CohortMembership {
    return new CohortMembership({
      id: this.id,
      cohortId: this.cohortId,
      userId: this.userId,
      paymentId: paymentId === undefined ? this.paymentId : paymentId,
      status: status ?? this.status,
      joinedAt: joinedAt === undefined ? this.joinedAt : joinedAt,
      expiresAt: expiresAt === undefined ? this.expiresAt : expiresAt,
      lastPaymentEventAt:
        lastPaymentEventAt === undefined
          ? this.lastPaymentEventAt
          : lastPaymentEventAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    });
  }
}
