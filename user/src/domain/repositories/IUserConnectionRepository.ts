import { TransactionContext } from "../../types/TransactionContext";
import { UserConnection } from "../entities/UserConnection";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserConnectionRepository extends IBaseRepository<UserConnection> {
  /**
   * Finds a connection between two users.
   *
   * **Important:** `userId1` must be lexicographically less than `userId2`
   * (i.e. `userId1 < userId2`), matching the ordering enforced by the
   * `UserConnection` entity constructor.
   */
  findByUserIds(
    userId1: string,
    userId2: string,
    tx?: TransactionContext,
  ): Promise<UserConnection>;

  /**
   * Inserts a new connection or accepts an existing one on conflict.
   *
   * If a connection between the same two users already exists (conflict on
   * `user_id_1` + `user_id_2`), the status is updated to "ACCEPTED" — but
   * only if the new requester is different from the original requester.
   * This prevents a user from accepting their own connection request.
   *
   * @returns The inserted or updated connection.
   */
  upsert(
    connection: UserConnection,
    tx?: TransactionContext,
  ): Promise<UserConnection>;

  /**
   * Finds all connections for a user
   *
   * @returns array of connections
   */
  findAllForUserId(
    userId: string,
    tx?: TransactionContext,
  ): Promise<UserConnection[]>;

  getAcceptedConnectionsForUserPaginated(
    params: {
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
  }>;
}
