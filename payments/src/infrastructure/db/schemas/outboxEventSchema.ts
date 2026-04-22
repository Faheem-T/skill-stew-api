import { InferSelectModel } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { outboxEventStatusEnum } from "./outboxEventStatusEnum";

export const outboxEventsTable = pgTable("outbox_events", {
  id: uuid().primaryKey(),
  event_name: text().notNull(),
  payload: jsonb().notNull(),
  status: outboxEventStatusEnum().notNull(),
  created_at: timestamp({ mode: "date", precision: 3 }).defaultNow().notNull(),
  processed_at: timestamp({ mode: "date", precision: 3 }),
});

export type OutboxEventsTableType = InferSelectModel<typeof outboxEventsTable>;
