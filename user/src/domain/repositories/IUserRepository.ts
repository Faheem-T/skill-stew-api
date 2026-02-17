import { User } from "../entities/User";
import { IBaseRepository } from "./IBaseRepository";
import { TransactionContext } from "../../types/TransactionContext";

export interface UserFilters {
  query?: string; // to query by username/email
  isVerified?: boolean;
}

export interface IUserRepository extends IBaseRepository<User> {
  findAll(
    {
      cursor,
      limit,
      filters,
    }: {
      cursor?: string;
      limit: number;
      filters?: UserFilters;
    },
    tx?: TransactionContext,
  ): Promise<{
    users: User[];
    hasNextPage: boolean;
    nextCursor: string | undefined;
  }>;
  findByEmail(email: string, tx?: TransactionContext): Promise<User>;
  findByUsername(username: string, tx?: TransactionContext): Promise<User>;
  getAllUsernames(tx?: TransactionContext): Promise<string[]>;
}
