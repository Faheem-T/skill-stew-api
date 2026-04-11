import {
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";
import { paymentStatusEnum } from "./paymentStatusEnum";

export const paymentsTable = pgTable(
  "payments",
  {
    payment_id: uuid().primaryKey(),
    membership_id: text().notNull(),
    user_id: text().notNull(),
    cohort_id: text().notNull(),
    workshop_id: text().notNull(),
    workshop_title: text().notNull(),
    expert_id: text().notNull(),
    amount: integer().notNull(),
    currency: text().notNull(),
    status: paymentStatusEnum().notNull(),
    stripe_checkout_session_id: text(),
    stripe_payment_intent_id: text(),
    checkout_url: text(),
    created_at: timestamp({ mode: "date", precision: 3 }).defaultNow().notNull(),
    updated_at: timestamp({ mode: "date", precision: 3 }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("payments_membership_id_unique").on(table.membership_id),
    uniqueIndex("payments_checkout_session_id_unique").on(
      table.stripe_checkout_session_id,
    ),
    uniqueIndex("payments_payment_intent_id_unique").on(
      table.stripe_payment_intent_id,
    ),
    index("payments_status_index").on(table.status),
  ],
);

export type PaymentsTableType = InferSelectModel<typeof paymentsTable>;
