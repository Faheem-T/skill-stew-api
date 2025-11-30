// import { pgTable, uuid, real } from "drizzle-orm/pg-core";
// import { userTable } from "./userSchema";
//
// export const locationsSchema = pgTable("locations", {
//   id: uuid().primaryKey(),
//   user_id: uuid()
//     .references(() => userTable.id)
//     .notNull(),
//   latitude: real().notNull(),
//   longitude: real().notNull(),
// });
