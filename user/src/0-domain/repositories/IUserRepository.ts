import { UserSchemaType } from "../../2-infrastructure/db/schemas/userSchema";
import { User } from "../entities/User";

export interface IUserRepository {
  getUserById(id: string): Promise<User | null>;
  getAllUsers(): Promise<Omit<UserSchemaType, "password_hash">[]>;
  save(user: User): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  blockUser(userId: string): Promise<User | null>;
  unblockUser(userId: string): Promise<User | null>;
}
