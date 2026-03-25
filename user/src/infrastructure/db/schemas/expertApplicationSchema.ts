import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";
import { userTable } from "./userSchema";
import { expertApplicationStatusEnum } from "./expertApplicationStatusEnum";

export const expertApplicationTable = pgTable(
  "expert_applications",
  {
    id: uuid().primaryKey(),
    expert_id: uuid()
      .references(() => userTable.id)
      .notNull(),
    status: expertApplicationStatusEnum("status").notNull(),
    submitted_at: timestamp().notNull(),
    reviewed_at: timestamp(),
    reviewed_by_admin_id: uuid().references(() => userTable.id),
    rejection_reason: text(),

    // Identity
    full_name: text().notNull(),
    phone: text().notNull(),
    social_links: text().array().notNull(),

    // Expertise
    years_experience: integer().notNull(),
    evidence_links: text().array().notNull(),
    has_teaching_experience: boolean().notNull(),
    teaching_experience_desc: text(),

    // Bio
    bio: text().notNull(),

    // Workshop Intent
    proposed_title: text().notNull(),
    proposed_description: text().notNull(),
    target_audience: text().notNull(),

    // Technical readiness
    confirmed_internet: boolean().notNull(),
    confirmed_camera: boolean().notNull(),
    confirmed_microphone: boolean().notNull(),

    // Legal
    terms_agreed: boolean().notNull(),
    terms_agreed_at: timestamp().notNull(),
  },
  (t) => [unique().on(t.expert_id)],
);

export type ExpertApplicationTableType = InferSelectModel<
  typeof expertApplicationTable
>;
