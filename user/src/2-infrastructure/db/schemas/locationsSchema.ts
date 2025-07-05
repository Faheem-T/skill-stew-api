import { pgTable, serial, integer, real } from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";

export const locationsSchema = pgTable("locations", {
  id: serial().primaryKey(),
  user_id: integer()
    .references(() => userSchema.id)
    .notNull(),
  latitude: real().notNull(),
  longitude: real().notNull(),
});
