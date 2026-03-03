import { and, eq, inArray, or, sql } from "drizzle-orm";
import { UserConnection } from "../../domain/entities/UserConnection";
import { IUserConnectionRepository } from "../../domain/repositories/IUserConnectionRepository";
import { db } from "../../start";
import { TransactionContext } from "../../types/TransactionContext";
import { userConnectionsTable } from "../db/schemas/userConnectionSchema";
import { mapDrizzleError } from "../mappers/ErrorMapper";
import { UserConnectionMapper } from "../mappers/UserConnectionMapper";
import { BaseRepository } from "./BaseRepository";
import { NotFoundError } from "../../domain/errors/NotFoundError";

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
}
