import { User } from "../../domain/entities/User";
import { UserAlreadyExistsError } from "../../domain/errors/UserAlreadyExistsError";
import {
  IUserRepository,
  UserFilters,
} from "../../domain/repositories/IUserRepository";
import { db } from "../../start";
import { decodeCursor, encodeCursor } from "../../utils/dbCursor";
import { DatabaseError } from "../errors/DatabaseError";
import { UserMapper } from "../mappers/UserMapper";
import { userSchema } from "./schemas/userSchema";
import { and, eq, ilike, gt, or } from "drizzle-orm";

export class UserRepository implements IUserRepository {
  getAllUsers = async ({
    cursor,
    limit,
    filters,
  }: {
    cursor?: string; // base 64 encoded
    limit: number;
    filters?: UserFilters;
  }): Promise<{
    users: User[];
    hasNextPage: boolean;
    nextCursor: string | undefined;
  }> => {
    const conditions: any[] = [];

    if (cursor) {
      const { createdAt, id } = decodeCursor(cursor);
      conditions.push(
        or(
          gt(userSchema.created_at, createdAt),
          and(eq(userSchema.created_at, createdAt), gt(userSchema.id, id)),
        ),
      );
    }

    if (filters) {
      const { query, isVerified } = filters;
      if (query) {
        conditions.push(
          or(
            ilike(userSchema.name, `%${query}%`),
            ilike(userSchema.username, `%${query}%`),
            ilike(userSchema.email, `%${query}%`),
          ),
        );
      }
      if (isVerified !== undefined) {
        conditions.push(eq(userSchema.is_verified, isVerified));
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    try {
      const rows = await db
        .select()
        .from(userSchema)
        .where(where)
        .orderBy(userSchema.created_at, userSchema.id)
        .limit(limit + 1);

      const hasNextPage = rows.length > limit;
      const sliced = hasNextPage ? rows.slice(0, -1) : rows;

      const users = sliced.map(UserMapper.toDomain);

      return {
        users,
        hasNextPage,
        nextCursor: hasNextPage
          ? encodeCursor(
              users[users.length - 1].createdAt!,
              users[users.length - 1].id!,
            )
          : undefined,
      };
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
