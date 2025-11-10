import { User } from "../entities/User";
import { IBaseRepository } from "./IBaseRepository";

export interface UserFilters {
  query?: string; // to query by name/username/email
  isVerified?: boolean;
}

export interface IUserRepository extends IBaseRepository<User> {
  // getUserById(id: string): Promise<User | null>;
  getAllUsers({
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
  getUserByEmail(email: string): Promise<User | null>;
  // save(user: User): Promise<User>;
  // blockUser(userId: string): Promise<User | null>;
  // unblockUser(userId: string): Promise<User | null>;
}
