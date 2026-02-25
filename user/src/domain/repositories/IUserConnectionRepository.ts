import { TransactionContext } from "../../types/TransactionContext";
import { UserConnection } from "../entities/UserConnection";
import { UserConnectionStatus } from "../entities/UserConnectionStatus";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserConnectionRepository extends IBaseRepository<UserConnection> {
  getConnectionStatus(
    userId: string,
    targetIds: string[],
    tx?: TransactionContext,
  ): Promise<{ recipientId: string; status: UserConnectionStatus }[]>;
}
