import { pgTable, text, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { InferSelectModel, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const userSchema = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
  role: text({ enum: ["USER", "EXPERT"] })
    .default("USER")
    .notNull(),
  name: text(),
  username: text(),
  email: text().unique().notNull(),
  password_hash: text(),
  phone_number: text(),
  avatar_url: text(),
  timezone: text(),
  about: text(),
  social_links: text()
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  languages: text()
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  is_subscribed: boolean(),
  years_of_experience: integer(),
  is_verified: boolean().default(false).notNull(),
  is_blocked: boolean().default(false).notNull(),
});

export type UserSchemaType = InferSelectModel<typeof userSchema>;
