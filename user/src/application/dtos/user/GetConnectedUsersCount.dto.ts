import z from "zod";

export const getConnectedUsersCountSchema = z.object({
  userId: z.string().uuid(),
});

export type GetConnectedUsersCountDTO = z.infer<
  typeof getConnectedUsersCountSchema
>;

export interface GetConnectedUsersCountOutputDTO {
  count: number;
}
