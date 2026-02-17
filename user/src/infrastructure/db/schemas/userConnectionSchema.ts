import { pgTable, pgEnum, uuid, unique } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";
import { timestamps } from "./timestamps";
import { userTable } from "./userSchema";
import { UserConnectionStatus } from "../../../domain/entities/UserConnectionStatus";

const connectionStatusEnum = pgEnum("connection_status", UserConnectionStatus);

export const userConnectionsTable = pgTable(
  "user_connections",
  {
    id: uuid().primaryKey(),
    requester_id: uuid()
      .references(() => userTable.id)
      .notNull(),
    recipient_id: uuid()
      .references(() => userTable.id)
      .notNull(),
    status: connectionStatusEnum("status").notNull(),
    ...timestamps,
  },
  (t) => [unique().on(t.recipient_id, t.requester_id)],
);

export type UserConnectionsTableType = InferSelectModel<
  typeof userConnectionsTable
>;
