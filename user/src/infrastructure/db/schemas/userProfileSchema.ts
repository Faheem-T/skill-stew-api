import { pgTable, text, json, boolean, uuid } from "drizzle-orm/pg-core";
import { InferSelectModel, sql } from "drizzle-orm";
import { timestamps } from "./timestamps";
import { IUserLocation } from "../../../domain/entities/UserProfile";
import { userTable } from "./userSchema";
import { randomUUID } from "crypto";

export const userProfileTable = pgTable("user_profiles", {
  id: uuid()
    .primaryKey()
    .$default(() => randomUUID()),
  user_id: uuid()
    .references(() => userTable.id)
    .notNull(),
  name: text(),
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
  location: json().$type<IUserLocation>(),
  is_onboarding_complete: boolean().notNull(),
  ...timestamps,
});

export type UserProfileTableType = InferSelectModel<typeof userProfileTable>;
