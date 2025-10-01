import {
  pgTable,
  text,
  integer,
  boolean,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";
import { InferSelectModel, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export const userSchema = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
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
  is_subscribed: boolean().default(false).notNull(),
  // years_of_experience: integer(),
  is_verified: boolean().default(false).notNull(),
  is_blocked: boolean().default(false).notNull(),
  is_google_login: boolean().default(false).notNull(),
  created_at: timestamp({ mode: "date", precision: 3 }).defaultNow().notNull(),
  updated_at: timestamp({ mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type UserSchemaType = InferSelectModel<typeof userSchema>;
