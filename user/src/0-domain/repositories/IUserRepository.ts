import { User } from "../entities/User";

export interface IUserRepository {
  getUserById(id: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  save(user: User): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  blockUser(userId: string): Promise<User | null>;
  unblockUser(userId: string): Promise<User | null>;
}
