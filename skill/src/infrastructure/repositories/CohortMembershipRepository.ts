import { CohortMembership } from "../../domain/entities/CohortMembership";
import type { CohortMembershipStatus } from "../../domain/entities/CohortMembershipStatus.enum";
import { mapMongooseError } from "../mappers/ErrorMapper";
import type { ICohortMembershipRepository } from "../../domain/repositories/ICohortMembershipRepository";
import type { TransactionContext } from "../../types/TransactionContext";
import {
  type CohortMembershipAttr,
  type CohortMembershipDoc,
  CohortMembershipModel,
} from "../models/cohortMembershipModel";

export class CohortMembershipRepository implements ICohortMembershipRepository {
  create = async (
    membership: CohortMembership,
    tx?: TransactionContext,
  ): Promise<CohortMembership> => {
    try {
      const attrs = this.toPersistence(membership);
      const newMembership = CohortMembershipModel.build(attrs);
      const saved = await newMembership.save({ session: tx });
      return this.toDomain(saved);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  findByCohortIdAndStatus = async (
    cohortId: string,
    status: CohortMembershipStatus,
    tx?: TransactionContext,
  ): Promise<CohortMembership[]> => {
    try {
      const docs = await CohortMembershipModel.find({ cohortId, status })
        .sort({ joinedAt: 1, createdAt: 1 })
        .session(tx ?? null);
      return docs.map((doc) => this.toDomain(doc));
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  findByUserIdAndStatuses = async (
    userId: string,
    statuses: CohortMembershipStatus[],
    tx?: TransactionContext,
  ): Promise<CohortMembership[]> => {
    try {
      const docs = await CohortMembershipModel.find({
        userId,
        status: { $in: statuses },
      }).session(tx ?? null);
      return docs.map((doc) => this.toDomain(doc));
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  countByCohortId = async (
    cohortId: string,
    tx?: TransactionContext,
  ): Promise<number> => {
    try {
      return await CohortMembershipModel.countDocuments({ cohortId }).session(
        tx ?? null,
      );
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  countByCohortIdAndStatuses = async (
    cohortId: string,
    statuses: CohortMembershipStatus[],
    tx?: TransactionContext,
  ): Promise<number> => {
    try {
      return await CohortMembershipModel.countDocuments({
        cohortId,
        status: { $in: statuses },
      }).session(tx ?? null);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  private toPersistence = (
    membership: CohortMembership,
  ): CohortMembershipAttr => {
    return {
      _id: membership.id,
      cohortId: membership.cohortId,
      userId: membership.userId,
      paymentId: membership.paymentId,
      status: membership.status,
      joinedAt: membership.joinedAt,
    };
  };

  private toDomain = (doc: CohortMembershipDoc): CohortMembership => {
    return new CohortMembership({
      id: doc._id,
      cohortId: doc.cohortId,
      userId: doc.userId,
      paymentId: doc.paymentId ?? null,
      status: doc.status,
      joinedAt: doc.joinedAt ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  };
}
