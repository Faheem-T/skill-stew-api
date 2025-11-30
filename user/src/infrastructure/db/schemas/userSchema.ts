import {
  pgTable,
  text,
  boolean,
  uuid,
  timestamp,
  json,
} from "drizzle-orm/pg-core";
import { InferSelectModel, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { IUserLocation } from "../../../domain/entities/User";

export const userTable = pgTable("users", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
  name: text(),
  username: text(),
  email: text().unique().notNull(),
  password_hash: text(),
  phone_number: text(),
  avatar_key: text(),
  banner_key: text(),
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
  is_verified: boolean().default(false).notNull(),
  is_blocked: boolean().default(false).notNull(),
  is_google_login: boolean().default(false).notNull(),
  location: json().$type<IUserLocation>(),
  created_at: timestamp({ mode: "date", precision: 3 }).defaultNow().notNull(),
  updated_at: timestamp({ mode: "date", precision: 3 })
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type UserTableType = InferSelectModel<typeof userTable>;
