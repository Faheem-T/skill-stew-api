import { pgEnum } from "drizzle-orm/pg-core";
import { OutboxEventStatus } from "../../../domain/entities/OutboxEventStatus.enum";

export const outboxEventStatusEnum = pgEnum(
  "outbox_event_status",
  OutboxEventStatus,
);
