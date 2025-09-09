import { User } from "../../0-domain/entities/User";
import { GetAllUsersDTO } from "../dtos/GetAllUsersDTO";
import { UserSchemaType } from "../../2-infrastructure/db/schemas/userSchema";

export interface IUserUsecases {
  createDummyUsers(): Promise<void>;
  getAllUsers(dto: GetAllUsersDTO): Promise<{
    users: Omit<UserSchemaType, "password_hash">[];
    hasNextPage: boolean;
    nextCursor: string | undefined;
  }>;
  blockUser(userId: string): Promise<User | null>;
  unblockUser(userId: string): Promise<User | null>;
}
