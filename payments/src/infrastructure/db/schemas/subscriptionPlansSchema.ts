import { pgTable, text, integer, uuid } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";
import { randomUUID } from "crypto";

export const subscriptionPlansSchema = pgTable("subscription_plans", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
  name: text().notNull(),
  monthly_price: integer().notNull(),
  yearly_price: integer().notNull(),
  currency: text().default("INR").notNull(),
  free_workshop_hours: integer().notNull(),
});

export type SubscriptionPlansSchemaType = InferSelectModel<
  typeof subscriptionPlansSchema
>;
