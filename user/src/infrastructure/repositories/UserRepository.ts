import { User } from "../../domain/entities/User";
import {
  IUserRepository,
  UserFilters,
} from "../../domain/repositories/IUserRepository";
import { db } from "../../start";
import { decodeCursor, encodeCursor } from "../../utils/dbCursor";
import { DatabaseError } from "../errors/DatabaseError";
import { UserMapper } from "../mappers/UserMapper";
import { userTable } from "../db/schemas/userSchema";
import { and, eq, ilike, gt, or, isNotNull } from "drizzle-orm";
import { BaseRepository } from "./BaseRepository";

export class UserRepository
  extends BaseRepository<User, typeof userTable>
  implements IUserRepository
{
  constructor() {
    super(userTable);
  }

  mapper = new UserMapper();

  findAll = async ({
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
          gt(userTable.created_at, createdAt),
          and(eq(userTable.created_at, createdAt), gt(userTable.id, id)),
        ),
      );
    }

    if (filters) {
      const { query, isVerified } = filters;
      if (query) {
        conditions.push(
          or(
            ilike(userTable.username, `%${query}%`),
            ilike(userTable.email, `%${query}%`),
          ),
        );
      }
      if (isVerified !== undefined) {
        conditions.push(eq(userTable.is_verified, isVerified));
      }
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    try {
      const rows = await db
        .select()
        .from(userTable)
        .where(where)
        .orderBy(userTable.created_at, userTable.id)
        .limit(limit + 1);

      const hasNextPage = rows.length > limit;
      const sliced = hasNextPage ? rows.slice(0, -1) : rows;

      const users = sliced.map(this.mapper.toDomain);

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

  findByEmail = async (email: string): Promise<User | null> => {
    try {
      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));
      if (!user) return null;
      return this.mapper.toDomain(user);
    } catch (err) {
      throw new DatabaseError(err);
    }
  };

  findByUsername = async (username: string): Promise<User | null> => {
    try {
      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.username, username));
      if (!user) return null;
      return this.mapper.toDomain(user);
    } catch (err) {
      throw new DatabaseError(err);
    }
  };

  getAllUsernames = async (): Promise<string[]> => {
    try {
      const rows = await db
        .select({ username: userTable.username })
        .from(userTable)
        .where(isNotNull(userTable.username));
      return rows.map((row) => row.username!);
    } catch (err) {
      throw new DatabaseError(err);
    }
  };
}
