import { pgTable, text, boolean, uuid } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";
import { randomUUID } from "crypto";
import { timestamps } from "./timestamps";
import { roleEnum } from "./roleEnum";

export const userTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
  email: text().unique().notNull(),
  role: roleEnum("role").notNull(),
  is_verified: boolean().default(false).notNull(),
  is_blocked: boolean().default(false).notNull(),
  is_google_login: boolean().default(false).notNull(),
  username: text().unique(),
  password_hash: text(),
  ...timestamps,
});

export type UserTableType = InferSelectModel<typeof userTable>;
