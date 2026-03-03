import z from "zod";

export const getConnectionStatusToUserSchema = z.object({
  userId: z.string().nonempty(),
  targetId: z.string().nonempty(),
});

export type GetConnectionStatusToUserDTO = z.infer<
  typeof getConnectionStatusToUserSchema
>;

export type GetConnectionStatusToUserOutputDTO =
  | {
      connectionId: string;
      status: "CONNECTED" | "PENDING_SENT" | "PENDING_RECEIVED";
    }
  | { connectionId: null; status: "NONE" };
