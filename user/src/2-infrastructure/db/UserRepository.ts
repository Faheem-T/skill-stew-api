import { User } from "../../0-domain/entities/User";
import { IUserRepository } from "../../0-domain/repositories/IUserRepository";
import { db } from "../../start";
import { UserMapper } from "../mappers/UserMapper";
import { userSchema } from "./schemas/userSchema";
import { eq } from "drizzle-orm";

export class UserRepository implements IUserRepository {
  getAllUsers = async (): Promise<User[] | null> => {
    try {
      const result = await db.select().from(userSchema);
      const users = [];
      for (const user of result) {
        users.push(UserMapper.toDomain(user));
      }
      return users;
    } catch (err) {
      console.log("Database error", err);
      return null;
    }
  };

  save = async (user: User): Promise<void> => {
    const pUser = UserMapper.toPersistence(user);
    if ("id" in pUser) {
      await db.update(userSchema).set(pUser).where(eq(userSchema.id, pUser.id));
    } else {
      await db.insert(userSchema).values(pUser);
    }
  };

  getUserById = async (id: number): Promise<User | null> => {
    try {
      const [user] = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.id, id));
      if (!user) return null;
      return UserMapper.toDomain(user);
    } catch (err) {
      console.log("Database error", err);
      return null;
    }
  };
}
