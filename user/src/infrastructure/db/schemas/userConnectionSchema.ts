import { pgTable, uuid, unique, index } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";
import { timestamps } from "./timestamps";
import { userTable } from "./userSchema";
import { connectionStatusEnum } from "./connectionStatusEnum";

export const userConnectionsTable = pgTable(
  "user_connections",
  {
    id: uuid().primaryKey(),
    user_id_1: uuid("userId1")
      .references(() => userTable.id)
      .notNull(),
    user_id_2: uuid("userId2")
      .references(() => userTable.id)
      .notNull(),
    requester_id: uuid("requesterId").notNull(),
    status: connectionStatusEnum("status").notNull(),
    ...timestamps,
  },
  (t) => [
    unique().on(t.user_id_1, t.user_id_2),
    index().on(t.user_id_1, t.user_id_2),
    index().on(t.user_id_1),
    index().on(t.user_id_2),
  ],
);

export type UserConnectionsTableType = InferSelectModel<
  typeof userConnectionsTable
>;
