import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
  created_at: timestamp({ mode: "date", precision: 3 }).defaultNow().notNull(),
  updated_at: timestamp({ mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date()),
};
