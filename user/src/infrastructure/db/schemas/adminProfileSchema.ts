import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { userTable } from "./userSchema";
import { randomUUID } from "crypto";
import { timestamps } from "./timestamps";
import { InferSelectModel } from "drizzle-orm";

export const adminProfileTable = pgTable("admin_profiles", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
  user_id: uuid()
    .references(() => userTable.id)
    .notNull(),
  name: text(),
  avatar_key: text(),
  ...timestamps,
});

export type AdminProfileTableType = InferSelectModel<typeof adminProfileTable>;
