import { UserSchemaType } from "../../1-infrastructure/db/schemas/userSchema";
import { User } from "../entities/User";

export interface IUserRepository {
  getUserById(id: number): Promise<User | null>;
  getAllUsers(): Promise<User[] | null>;
  save(user: User): Promise<void>;
}
