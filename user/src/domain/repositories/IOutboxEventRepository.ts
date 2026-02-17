import { TransactionContext } from "../../types/TransactionContext";
import { OutboxEvent } from "../entities/OutboxEvent";

export interface IOutboxEventRepository {
  create(event: OutboxEvent, tx?: TransactionContext): Promise<void>;
  markProcessed(eventId: string): Promise<void>;
  getPending(limit: number): Promise<OutboxEvent[]>;
}
