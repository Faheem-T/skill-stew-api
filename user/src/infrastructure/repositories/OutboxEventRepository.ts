import { OutboxEvent } from "../../domain/entities/OutboxEvent";
import { IOutboxEventRepository } from "../../domain/repositories/IOutboxEventRepository";
import { db } from "../../start";
import {
  outboxEventsTable,
  OutboxEventsTableType,
} from "../db/schemas/outboxEventSchema";
import { v7 as uuid } from "uuid";
import { mapDrizzleError } from "../mappers/ErrorMapper";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../../domain/errors/NotFoundError";

export class OutboxEventRepository implements IOutboxEventRepository {
  create = async (event: OutboxEvent): Promise<void> => {
    const table: OutboxEventsTableType = {
      id: uuid(),
      event_name: event.name,
      payload: event.payload,
      status: event.status,
      created_at: event.createdAt,
      processed_at: event.processedAt ?? null,
    };
    try {
      db.insert(outboxEventsTable).values(table);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  markProcessed = async (eventId: string): Promise<void> => {
    let row: OutboxEventsTableType;
    try {
      const rows = await db
        .update(outboxEventsTable)
        .set({ status: "PROCESSED" })
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

  getPending = async (limit: number = 20): Promise<OutboxEvent[]> => {
    try {
      const rows = await db
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
