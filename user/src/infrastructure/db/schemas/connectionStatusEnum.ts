import { pgEnum } from "drizzle-orm/pg-core";
import { UserConnectionStatus } from "../../../domain/entities/UserConnectionStatus";

export const connectionStatusEnum = pgEnum(
  "connection_status",
  UserConnectionStatus,
);
