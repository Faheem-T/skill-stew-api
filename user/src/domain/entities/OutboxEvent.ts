import { OutboxEventStatus } from "./OutboxEventStatus.enum";

export class OutboxEvent {
  constructor(
    public id: string,
    public name: string,
    public payload: unknown,
    public status: OutboxEventStatus,
    public createdAt: Date,
    public processedAt: Date | undefined,
  ) {}
}
