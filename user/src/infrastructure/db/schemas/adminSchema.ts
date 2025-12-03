import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";
import { randomUUID } from "crypto";

export const adminSchema = pgTable("admin", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
  username: text().notNull(),
  password_hash: text().notNull(),
  avatar_key: text(),
});

export type AdminSchemaType = InferSelectModel<typeof adminSchema>;
