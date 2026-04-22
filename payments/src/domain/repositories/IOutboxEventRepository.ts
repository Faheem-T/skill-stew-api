import type { TransactionContext } from "../../types/TransactionContext";
import type { OutboxEvent } from "../entities/OutboxEvent";

export interface IOutboxEventRepository {
  create(event: OutboxEvent, tx?: TransactionContext): Promise<void>;
}
