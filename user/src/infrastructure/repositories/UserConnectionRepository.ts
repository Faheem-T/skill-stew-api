import { and, eq, inArray } from "drizzle-orm";
import { UserConnection } from "../../domain/entities/UserConnection";
import { IUserConnectionRepository } from "../../domain/repositories/IUserConnectionRepository";
import { db } from "../../start";
import { TransactionContext } from "../../types/TransactionContext";
import { userConnectionsTable } from "../db/schemas/userConnectionSchema";
import { mapDrizzleError } from "../mappers/ErrorMapper";
import { UserConnectionMapper } from "../mappers/UserConnectionMapper";
import { BaseRepository } from "./BaseRepository";
import { UserConnectionStatus } from "../../domain/entities/UserConnectionStatus";
import { NotFoundError } from "../../domain/errors/NotFoundError";

export class UserConnectionRepository
  extends BaseRepository<UserConnection, typeof userConnectionsTable>
  implements IUserConnectionRepository
{
  constructor() {
    super(userConnectionsTable);
  }
  mapper = new UserConnectionMapper();

  getConnectionStatus = async (
    userId: string,
    targetIds: string[],
    tx?: TransactionContext,
  ): Promise<{ recipientId: string; status: UserConnectionStatus }[]> => {
    try {
      const runner = tx ?? db;

      const rows = await runner
        .select({
          recipientId: this.table.recipient_id,
          status: this.table.status,
        })
        .from(this.table)
        .where(
          and(
            eq(this.table.requester_id, userId),
            inArray(this.table.recipient_id, targetIds),
          ),
        );

      return rows;
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  findByRequesterAndRecipientId = async (
    requesterId: string,
    recipientId: string,
    tx?: TransactionContext,
  ): Promise<UserConnection> => {
    try {
      const runner = tx ?? db;

      const rows = await runner
        .select()
        .from(this.table)
        .where(
          and(
            eq(this.table.requester_id, requesterId),
            eq(this.table.recipient_id, recipientId),
          ),
        );

      const connectionRow = rows[0];
      if (!connectionRow) {
        throw new NotFoundError("Connection");
      }

      return this.mapper.toDomain(connectionRow);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };
}
