import { OutboxEvent } from "../entities/OutboxEvent";

export interface IOutboxEventRepository {
  create(event: OutboxEvent): Promise<void>;
  markProcessed(eventId: string): Promise<void>;
  getPending(limit: number): Promise<OutboxEvent[]>;
}
