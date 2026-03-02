import z from "zod";
import { UserConnectionStatus } from "../../../domain/entities/UserConnectionStatus";

export const getConnectionStatusToUserSchema = z.object({
  userId: z.string().nonempty(),
  targetId: z.string().nonempty(),
});

export type GetConnectionStatusToUserDTO = z.infer<
  typeof getConnectionStatusToUserSchema
>;

export type GetConnectionStatusToUserOutputDTO =
  | UserConnectionStatus
  | "CURRENT_USER_REQUESTING"
  | "REJECTED_BY_TARGET_USER"
  | "NONE";
