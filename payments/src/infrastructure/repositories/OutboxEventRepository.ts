import { db } from "../../start";
import type { OutboxEvent } from "../../domain/entities/OutboxEvent";
import type { IOutboxEventRepository } from "../../domain/repositories/IOutboxEventRepository";
import type { TransactionContext } from "../../types/TransactionContext";
import { outboxEventsTable } from "../db/schemas/outboxEventSchema";
import { mapDrizzleError } from "../mappers/ErrorMapper";

export class OutboxEventRepository implements IOutboxEventRepository {
  async create(event: OutboxEvent, tx?: TransactionContext): Promise<void> {
    const runner = tx ?? db;

    try {
      await runner.insert(outboxEventsTable).values({
        id: event.id,
        event_name: event.name,
        payload: event.payload,
        status: event.status,
        created_at: event.createdAt,
        processed_at: event.processedAt ?? null,
      });
    } catch (error) {
      throw mapDrizzleError(error);
    }
  }
}
