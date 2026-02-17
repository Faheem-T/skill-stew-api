import { OutboxEvent } from "../../domain/entities/OutboxEvent";
import { IOutboxEventRepository } from "../../domain/repositories/IOutboxEventRepository";
import { db } from "../../start";
import {
  outboxEventsTable,
  OutboxEventsTableType,
} from "../db/schemas/outboxEventSchema";
import { mapDrizzleError } from "../mappers/ErrorMapper";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { TransactionContext } from "../../types/TransactionContext";

export class OutboxEventRepository implements IOutboxEventRepository {
  create = async (
    event: OutboxEvent,
    tx?: TransactionContext,
  ): Promise<void> => {
    const table: OutboxEventsTableType = {
      id: event.id,
      event_name: event.name,
      payload: event.payload,
      status: event.status,
      created_at: event.createdAt,
      processed_at: event.processedAt ?? null,
    };
    const runner = tx ?? db;
    try {
      await runner.insert(outboxEventsTable).values(table);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  markProcessed = async (
    eventId: string,
    tx?: TransactionContext,
  ): Promise<void> => {
    let row: OutboxEventsTableType;
    try {
      const runner = tx ?? db;
      const rows = await runner
        .update(outboxEventsTable)
        .set({ status: "PROCESSED", processed_at: new Date() })
        .where(eq(outboxEventsTable.id, eventId))
        .returning();
      row = rows[0];
    } catch (err) {
      throw mapDrizzleError(err);
    }

    if (!row) {
      throw new NotFoundError("Outbox event");
    }
  };

  getPending = async (
    limit: number = 20,
    tx?: TransactionContext,
  ): Promise<OutboxEvent[]> => {
    try {
      const runner = tx ?? db;
      const rows = await runner
        .select()
        .from(outboxEventsTable)
        .where(eq(outboxEventsTable.status, "PENDING"))
        .limit(limit);

      return rows.map(
        (row) =>
          new OutboxEvent(
            row.id,
            row.event_name,
            row.payload,
            row.status,
            row.created_at,
            row.processed_at ?? undefined,
          ),
      );
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };
}
