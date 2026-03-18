import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { userTable } from "./userSchema";
import { InferSelectModel } from "drizzle-orm";

export const expertProfileTable = pgTable("expert_profiles", {
  id: uuid().primaryKey(),
  expert_id: uuid()
    .references(() => userTable.id)
    .notNull(),
  full_name: text().notNull(),
  phone: text().notNull(),
  social_links: text().array().notNull(),
  bio: text().notNull(),

  // Expertise
  years_experience: integer().notNull(),
  evidence_links: text().array().notNull(),
  has_teaching_experience: boolean().notNull(),
  teaching_experience_desc: text(),

  avatar_key: text(),
  banner_key: text(),
  languages: text().array(),

  joined_at: timestamp().notNull(),
});

export type ExpertProfileTableType = InferSelectModel<
  typeof expertProfileTable
>;
