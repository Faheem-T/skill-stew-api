import z from "zod";

export const getConnectedUsersSchema = z.object({
  userId: z.string().uuid(),
  limit: z.coerce.number().int().min(1).default(10),
  cursor: z.string().optional(),
});

export type GetConnectedUsersDTO = z.infer<typeof getConnectedUsersSchema>;

export interface ConnectedUserListItemDTO {
  id: string;
  username: string | null;
  avatarUrl: string | null;
  connectedAt: Date;
}

export interface GetConnectedUsersOutputDTO {
  users: ConnectedUserListItemDTO[];
  hasNextPage: boolean;
  nextCursor: string | undefined;
}
