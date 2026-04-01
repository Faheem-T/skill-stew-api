import { Workshop } from "../../domain/entities/Workshop";
import { NotFoundError } from "../../domain/errors";
import type { IWorkshopRepository } from "../../domain/repositories/IWorkshopRepository";
import type { TransactionContext } from "../../types/TransactionContext";
import {
  type WorkshopAttr,
  type WorkshopDoc,
  WorkshopModel,
} from "../models/workshopModel";
import { mapMongooseError } from "../mappers/ErrorMapper";

export class WorkshopRepository implements IWorkshopRepository {
  create = async (
    workshop: Workshop,
    tx?: TransactionContext,
  ): Promise<Workshop> => {
    try {
      const attrs = this.toPersistence(workshop);
      const newWorkshop = WorkshopModel.build(attrs);
      const savedWorkshop = await newWorkshop.save({ session: tx });
      return this.toDomain(savedWorkshop);
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  getById = async (id: string, tx?: TransactionContext): Promise<Workshop> => {
    try {
      const doc = await WorkshopModel.findById(id).session(tx ?? null);
      if (!doc) {
        throw new NotFoundError("Workshop");
      }
      return this.toDomain(doc);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw mapMongooseError(error);
    }
  };

  findByExpertId = async (
    expertId: string,
    status?: Workshop["status"],
    tx?: TransactionContext,
  ): Promise<Workshop[]> => {
    try {
      const query = status
        ? { expertId, status }
        : { expertId };

      const docs = await WorkshopModel.find(query)
        .sort({ updatedAt: -1 })
        .session(tx ?? null);

      return docs.map((doc) => this.toDomain(doc));
    } catch (error) {
      throw mapMongooseError(error);
    }
  };

  update = async (
    workshop: Workshop,
    tx?: TransactionContext,
  ): Promise<Workshop> => {
    try {
      const attrs = this.toPersistence(workshop);
      const updatedWorkshop = await WorkshopModel.findByIdAndUpdate(
        workshop.id,
        attrs,
        { new: true, runValidators: true, session: tx },
      );

      if (!updatedWorkshop) {
        throw new NotFoundError("Workshop");
      }

      return this.toDomain(updatedWorkshop);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw mapMongooseError(error);
    }
  };

  private toPersistence = (workshop: Workshop): WorkshopAttr => {
    return {
      _id: workshop.id,
      expertId: workshop.expertId,
      title: workshop.title,
      description: workshop.description,
      targetAudience: workshop.targetAudience,
      bannerImageKey: workshop.bannerImageKey,
      maxCohortSize: workshop.maxCohortSize,
      status: workshop.status,
      sessions: workshop.sessions.map((session) => ({
        _id: session.id,
        weekNumber: session.weekNumber,
        dayOfWeek: session.dayOfWeek,
        sessionOrder: session.sessionOrder,
        title: session.title ?? null,
        description: session.description ?? null,
        startTime: session.startTime,
      })),
      timezone: workshop.timezone,
    };
  };

  private toDomain = (doc: WorkshopDoc): Workshop => {
    return new Workshop({
      id: doc._id,
      expertId: doc.expertId,
      title: doc.title,
      description: doc.description ?? null,
      targetAudience: doc.targetAudience ?? null,
      bannerImageKey: doc.bannerImageKey ?? null,
      maxCohortSize: doc.maxCohortSize,
      status: doc.status,
      sessions: doc.sessions.map((session) => ({
        id: session._id,
        weekNumber: session.weekNumber,
        dayOfWeek: session.dayOfWeek,
        sessionOrder: session.sessionOrder,
        title: session.title ?? null,
        description: session.description ?? null,
        startTime: session.startTime,
      })),
      timezone: doc.timezone ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  };
}
