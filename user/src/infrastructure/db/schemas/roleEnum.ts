import { pgEnum } from "drizzle-orm/pg-core";
import { USER_ROLES } from "../../../domain/entities/UserRoles";

export const roleEnum = pgEnum("role", USER_ROLES);
