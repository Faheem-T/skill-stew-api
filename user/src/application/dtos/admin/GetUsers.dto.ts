import z from "zod";
import { User } from "../../../domain/entities/User";

export const getUsersSchema = z.object({
  limit: z.number().min(1),
  cursor: z.string().optional(),
  filters: z
    .object({
      query: z.string().optional(),
      isVerified: z.boolean().optional(),
    })
    .optional(),
});

export type GetUsersDTO = z.infer<typeof getUsersSchema>;

export type AdminGetUserOutputDTO = Pick<
  User,
  | "id"
  | "email"
  | "role"
  | "isVerified"
  | "isBlocked"
  | "createdAt"
  | "username"
>;

export interface AdminSearchUsersOutputDTO {
  users: AdminGetUserOutputDTO[];
  hasNextPage: boolean;
  nextCursor: string | undefined;
}
