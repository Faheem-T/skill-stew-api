import { pgTable, text, integer, uuid, boolean } from "drizzle-orm/pg-core";
import { InferSelectModel, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const subscriptionPlansSchema = pgTable("subscription_plans", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
  name: text().notNull(),
  description: text().notNull(),
  active: boolean().notNull().default(true),
  monthly_price: integer().notNull(),
  yearly_price: integer().notNull(),
  currency: text().default("INR").notNull(),
  free_workshop_hours: integer().notNull(),
  features: text()
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
});

export type SubscriptionPlansSchemaType = InferSelectModel<
  typeof subscriptionPlansSchema
>;
