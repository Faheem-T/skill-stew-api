import type { OutboxEvent } from "../../domain/entities/OutboxEvent";
import type { IOutboxEventRepository } from "../../domain/repositories/IOutboxEventRepository";
import type { TransactionContext } from "../../types/TransactionContext";
import { mapMongooseError } from "../mappers/ErrorMapper";
import { OutboxEventModel } from "../models/outboxEventModel";

export class OutboxEventRepository implements IOutboxEventRepository {
  create = async (
    event: OutboxEvent,
    tx?: TransactionContext,
  ): Promise<void> => {
    try {
      const doc = OutboxEventModel.build({
        _id: event.id,
        event_name: event.name,
        payload: event.payload,
        status: event.status,
        created_at: event.createdAt,
        processed_at: event.processedAt ?? null,
      });
      await doc.save({ session: tx });
    } catch (error) {
      throw mapMongooseError(error);
    }
  };
}
