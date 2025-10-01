import { pgTable, uuid, serial, real } from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";

export const locationsSchema = pgTable("locations", {
  id: serial().primaryKey(),
  user_id: uuid()
    .references(() => userSchema.id)
    .notNull(),
  latitude: real().notNull(),
  longitude: real().notNull(),
});
