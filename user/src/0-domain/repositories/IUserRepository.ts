import { User } from "../entities/User";

export interface IUserRepository {
  getUserById(id: number): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  save(user: User): Promise<void>;
  getUserByEmail(email: string): Promise<User | null>;
}
