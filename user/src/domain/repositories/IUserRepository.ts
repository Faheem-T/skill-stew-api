import { User } from "../entities/User";

export interface UserFilters {
  query?: string; // to query by name/username/email
  isVerified?: boolean;
}

export interface IUserRepository {
  getUserById(id: string): Promise<User | null>;
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
  save(user: User): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  blockUser(userId: string): Promise<User | null>;
  unblockUser(userId: string): Promise<User | null>;
}
