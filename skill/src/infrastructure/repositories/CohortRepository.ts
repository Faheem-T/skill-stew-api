import { Cohort } from "../../domain/entities/Cohort";
import { NotFoundError } from "../../domain/errors";
import type { ICohortRepository } from "../../domain/repositories/ICohortRepository";
import type { TransactionContext } from "../../types/TransactionContext";
import { mapMongooseError } from "../mappers/ErrorMapper";
import {
  type CohortAttr,
  type CohortDoc,
  CohortModel,
} from "../models/cohortModel";

export class CohortRepository implements ICohortRepository {
  create = async (cohort: Cohort, tx?: TransactionContext): Promise<Cohort> => {
    try {
      const attrs = this.toPersistence(cohort);
      const newCohort = CohortModel.build(attrs);
      const saved = await newCohort.save({ session: tx });
      return this.toDomain(saved);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  getById = async (id: string, tx?: TransactionContext): Promise<Cohort> => {
    try {
      const doc = await CohortModel.findById(id).session(tx ?? null);
      if (!doc) {
        throw new NotFoundError("Cohort");
      }
      return this.toDomain(doc);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw mapMongooseError(error);
    }
  };

  getByIds = async (ids: string[], tx?: TransactionContext): Promise<Cohort[]> => {
    try {
      if (ids.length === 0) {
        return [];
      }
      const docs = await CohortModel.find({ _id: { $in: ids } }).session(tx ?? null);
      return docs.map((doc) => this.toDomain(doc));
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  findByWorkshopId = async (
    workshopId: string,
    tx?: TransactionContext,
  ): Promise<Cohort[]> => {
    try {
      const docs = await CohortModel.find({ workshopId })
        .sort({ firstSessionStartsAt: 1 })
        .session(tx ?? null);
      return docs.map((doc) => this.toDomain(doc));
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  findByExpertId = async (
    expertId: string,
    workshopId?: string,
    tx?: TransactionContext,
  ): Promise<Cohort[]> => {
    try {
      const query = workshopId ? { expertId, workshopId } : { expertId };
      const docs = await CohortModel.find(query)
        .sort({ firstSessionStartsAt: 1 })
        .session(tx ?? null);
      return docs.map((doc) => this.toDomain(doc));
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  existsByWorkshopId = async (
    workshopId: string,
    tx?: TransactionContext,
  ): Promise<boolean> => {
    try {
      const doc = await CohortModel.exists({ workshopId }).session(tx ?? null);
      return Boolean(doc);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  findOverlappingByWorkshopId = async (
    workshopId: string,
    firstSessionStartsAt: Date,
    lastSessionStartsAt: Date,
    excludeCohortId?: string,
    tx?: TransactionContext,
  ): Promise<Cohort | null> => {
    try {
      const query: Record<string, unknown> = {
        workshopId,
        firstSessionStartsAt: { $lte: lastSessionStartsAt },
        lastSessionStartsAt: { $gte: firstSessionStartsAt },
      };

      if (excludeCohortId) {
        query._id = { $ne: excludeCohortId };
      }

      const doc = await CohortModel.findOne(query).session(tx ?? null);
      return doc ? this.toDomain(doc) : null;
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  update = async (cohort: Cohort, tx?: TransactionContext): Promise<Cohort> => {
    try {
      const attrs = this.toPersistence(cohort);
      const updated = await CohortModel.findByIdAndUpdate(cohort.id, attrs, {
        new: true,
        runValidators: true,
        session: tx,
      });

      if (!updated) {
        throw new NotFoundError("Cohort");
      }

      return this.toDomain(updated);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw mapMongooseError(error);
    }
  };

  delete = async (id: string, tx?: TransactionContext): Promise<void> => {
    try {
      const deleted = await CohortModel.findByIdAndDelete(id, { session: tx });
      if (!deleted) {
        throw new NotFoundError("Cohort");
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw mapMongooseError(error);
    }
  };

  private toPersistence = (cohort: Cohort): CohortAttr => {
    return {
      _id: cohort.id,
      workshopId: cohort.workshopId,
      expertId: cohort.expertId,
      workshopTitle: cohort.workshopTitle,
      workshopBannerImageKey: cohort.workshopBannerImageKey,
      workshopTimezone: cohort.workshopTimezone,
      spotPriceAmount: cohort.spotPriceAmount,
      currency: cohort.currency,
      startDate: cohort.startDate,
      maxStudents: cohort.maxStudents,
      firstSessionStartsAt: cohort.firstSessionStartsAt,
      lastSessionStartsAt: cohort.lastSessionStartsAt,
    };
  };

  private toDomain = (doc: CohortDoc): Cohort => {
    return new Cohort({
      id: doc._id,
      workshopId: doc.workshopId,
      expertId: doc.expertId,
      workshopTitle: doc.workshopTitle,
      workshopBannerImageKey: doc.workshopBannerImageKey ?? null,
      workshopTimezone: doc.workshopTimezone,
      spotPriceAmount: doc.spotPriceAmount,
      currency: doc.currency,
      startDate: doc.startDate,
      maxStudents: doc.maxStudents,
      firstSessionStartsAt: doc.firstSessionStartsAt,
      lastSessionStartsAt: doc.lastSessionStartsAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  };
}
