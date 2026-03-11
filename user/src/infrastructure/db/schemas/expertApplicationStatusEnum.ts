import { pgEnum } from "drizzle-orm/pg-core";
import { ExpertApplicationStatus } from "../../../domain/entities/ExpertApplicationStatus.enum";

export const expertApplicationStatusEnum = pgEnum(
  "expert_application_status",
  ExpertApplicationStatus,
);
