import { User } from "../entities/User";
import { IBaseRepository } from "./IBaseRepository";

export interface UserFilters {
  query?: string; // to query by username/email
  isVerified?: boolean;
}

export interface IUserRepository extends IBaseRepository<User> {
  findAll({
    cursor,
    limit,
    filters,
  }: {
    cursor?: string;
    limit: number;
    filters?: UserFilters;
  }): Promise<{
    users: User[];
    hasNextPage: boolean;
    nextCursor: string | undefined;
  }>;
  findByEmail(email: string): Promise<User>;
  findByUsername(username: string): Promise<User>;
  getAllUsernames(): Promise<string[]>;
}
