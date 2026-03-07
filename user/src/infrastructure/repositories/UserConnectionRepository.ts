import { and, desc, eq, lt, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { UserConnection } from "../../domain/entities/UserConnection";
import { IUserConnectionRepository } from "../../domain/repositories/IUserConnectionRepository";
import { db } from "../../start";
import { TransactionContext } from "../../types/TransactionContext";
import { userConnectionsTable } from "../db/schemas/userConnectionSchema";
import { mapDrizzleError } from "../mappers/ErrorMapper";
import { UserConnectionMapper } from "../mappers/UserConnectionMapper";
import { BaseRepository } from "./BaseRepository";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { userTable } from "../db/schemas/userSchema";
import { userProfileTable } from "../db/schemas/userProfileSchema";
import {
  decodeConnectedUsersCursor,
  encodeConnectedUsersCursor,
} from "../../utils/connectedUsersCursor";

export class UserConnectionRepository
  extends BaseRepository<UserConnection, typeof userConnectionsTable>
  implements IUserConnectionRepository
{
  constructor() {
    super(userConnectionsTable);
  }
  mapper = new UserConnectionMapper();

  findByUserIds = async (
    userId1: string,
    userId2: string,
    tx?: TransactionContext,
  ): Promise<UserConnection> => {
    try {
      const runner = tx ?? db;

      const rows = await runner
        .select()
        .from(this.table)
        .where(
          and(
            eq(this.table.user_id_1, userId1),
            eq(this.table.user_id_2, userId2),
          ),
        );

      if (!rows[0]) {
        throw new NotFoundError("Connection");
      }

      return this.mapper.toDomain(rows[0]);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  upsert = async (
    connection: UserConnection,
    tx?: TransactionContext,
  ): Promise<UserConnection> => {
    try {
      const runner = tx ?? db;

      const data = this.mapper.toPersistence(connection);

      const rows = await runner
        .insert(this.table)
        .values(data)
        .onConflictDoUpdate({
          // If a row with the same (user_id_1, user_id_2) pair already exists,
          // it means a connection request between these two users was already sent.
          target: [this.table.user_id_1, this.table.user_id_2],

          // Mark the connection as accepted (mutual request).
          set: { status: "ACCEPTED" },

          // Only accept if the new requester is NOT the original requester.
          // This prevents a user from accepting their own request by
          // sending a duplicate — only the other party can trigger acceptance.
          setWhere: sql`${this.table.requester_id} != ${connection.requesterId}`,
        })
        .returning();

      return this.mapper.toDomain(rows[0]);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  findAllForUserId = async (
    userId: string,
    tx?: TransactionContext,
  ): Promise<UserConnection[]> => {
    try {
      const runner = tx ?? db;

      const rows = await runner
        .select()
        .from(this.table)
        .where(
          or(
            eq(this.table.user_id_1, userId),
            eq(this.table.user_id_2, userId),
          ),
        );

      return rows.map(this.mapper.toDomain);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  getAcceptedConnectionsForUserPaginated = async (
    {
      userId,
      limit,
      cursor,
    }: {
      userId: string;
      limit: number;
      cursor?: string;
    },
    tx?: TransactionContext,
  ): Promise<{
    rows: Array<{
      connectionId: string;
      connectedAt: Date;
      connectedUserId: string;
      username: string | null;
      avatarKey: string | null;
    }>;
    hasNextPage: boolean;
    nextCursor: string | undefined;
  }> => {
    try {
      const runner = tx ?? db;
      const connectedUser = alias(userTable, "connected_user");
      const connectedUserProfile = alias(userProfileTable, "connected_user_profile");

      const connectedUserIdSql = sql<string>`case
        when ${this.table.user_id_1} = ${userId} then ${this.table.user_id_2}
        else ${this.table.user_id_1}
      end`;

      const conditions = [
        eq(this.table.status, "ACCEPTED"),
        or(eq(this.table.user_id_1, userId), eq(this.table.user_id_2, userId)),
      ];

      if (cursor) {
        const { connectedAt, connectionId } = decodeConnectedUsersCursor(cursor);

        conditions.push(
          or(
            lt(this.table.updated_at, connectedAt),
            and(
              eq(this.table.updated_at, connectedAt),
              lt(this.table.id, connectionId),
            ),
          )!,
        );
      }

      const rows = await runner
        .select({
          connectionId: this.table.id,
          connectedAt: this.table.updated_at,
          connectedUserId: connectedUser.id,
          username: connectedUser.username,
          avatarKey: connectedUserProfile.avatar_key,
        })
        .from(this.table)
        .innerJoin(connectedUser, eq(connectedUser.id, connectedUserIdSql))
        .leftJoin(
          connectedUserProfile,
          eq(connectedUserProfile.user_id, connectedUser.id),
        )
        .where(and(...conditions))
        .orderBy(desc(this.table.updated_at), desc(this.table.id))
        .limit(limit + 1);

      const hasNextPage = rows.length > limit;
      const sliced = hasNextPage ? rows.slice(0, -1) : rows;

      return {
        rows: sliced.map((row) => ({
          connectionId: row.connectionId,
          connectedAt: row.connectedAt,
          connectedUserId: row.connectedUserId,
          username: row.username,
          avatarKey: row.avatarKey,
        })),
        hasNextPage,
        nextCursor: hasNextPage
          ? encodeConnectedUsersCursor(
              sliced[sliced.length - 1].connectedAt,
              sliced[sliced.length - 1].connectionId,
            )
          : undefined,
      };
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };
}
