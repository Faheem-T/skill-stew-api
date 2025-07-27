import { User } from "../../0-domain/entities/User";
import { UserAlreadyExistsError } from "../../0-domain/errors/UserAlreadyExistsError";
import { IUserRepository } from "../../0-domain/repositories/IUserRepository";
import { db } from "../../start";
import { DatabaseError } from "../errors/DatabaseError";
import { UserMapper } from "../mappers/UserMapper";
import { userSchema, UserSchemaType } from "./schemas/userSchema";
import { eq } from "drizzle-orm";

export class UserRepository implements IUserRepository {
  getAllUsers = async (): Promise<UserSchemaType[]> => {
    try {
      const result = await db.select().from(userSchema);
      return result;
    } catch (err) {
      throw new DatabaseError(err);
    }
  };

  save = async (user: User): Promise<User> => {
    const pUser = UserMapper.toPersistence(user);
    if ("id" in pUser) {
      const [user] = await db
        .update(userSchema)
        .set(pUser)
        .where(eq(userSchema.id, pUser.id))
        .returning();
      return UserMapper.toDomain(user);
    } else {
      const foundUser = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, pUser.email));
      if (foundUser.length > 0) {
        throw new UserAlreadyExistsError(pUser.email);
      }

      const [user] = await db.insert(userSchema).values(pUser).returning();
      return UserMapper.toDomain(user);
    }
  };

  getUserById = async (id: string): Promise<User | null> => {
    try {
      const [user] = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.id, id));
      if (!user) return null;
      return UserMapper.toDomain(user);
    } catch (err) {
      throw new DatabaseError(err);
    }
  };

  getUserByEmail = async (email: string): Promise<User | null> => {
    try {
      const [user] = await db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, email));
      if (!user) return null;
      return UserMapper.toDomain(user);
    } catch (err) {
      throw new DatabaseError(err);
    }
  };

  blockUser = async (userId: string): Promise<User | null> => {
    try {
      const [user] = await db
        .update(userSchema)
        .set({ is_blocked: true })
        .where(eq(userSchema.id, userId))
        .returning();
      if (!user) return null;
      return UserMapper.toDomain(user);
    } catch (err) {
      throw new DatabaseError(err);
    }
  };
  unblockUser = async (userId: string): Promise<User | null> => {
    try {
      const [user] = await db
        .update(userSchema)
        .set({ is_blocked: false })
        .where(eq(userSchema.id, userId))
        .returning();
      if (!user) return null;
      return UserMapper.toDomain(user);
    } catch (err) {
      throw new DatabaseError(err);
    }
  };
}
