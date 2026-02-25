import z from "zod";
import { UserConnectionStatus } from "../../../domain/entities/UserConnectionStatus";

export const getConnectionStatusesSchema = z.object({
  userId: z.string().nonempty(),
  targetIds: z.array(z.string().nonempty()),
});

export type GetConnectionStatusesDTO = z.infer<
  typeof getConnectionStatusesSchema
>;

export type GetConnectionStatusesOutputDTO = Record<
  string,
  UserConnectionStatus
>;
