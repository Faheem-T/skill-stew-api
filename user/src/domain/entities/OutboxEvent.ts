import { OutboxEventStatus } from "./OutboxEventStatus.enum";

export class OutboxEvent {
  constructor(
    public id: string,
    public name: string,
    public payload: string,
    public status: OutboxEventStatus,
    public createdAt: Date,
    public processedAt: Date | undefined,
  ) {}
}
