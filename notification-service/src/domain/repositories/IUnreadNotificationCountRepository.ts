import type { TransactionContext } from "../../types/TransactionContext";

export interface IUnreadNotificationCountRepository {
  getByUserId(userId: string, tx?: TransactionContext): Promise<number>;
  createByUserId(userId: string, tx?: TransactionContext): Promise<number>;
  incrementByUserId(
    userId: string,
    inc: number,
    tx?: TransactionContext,
  ): Promise<number>;
  decrementByUserId(
    userId: string,
    dec: number,
    tx?: TransactionContext,
  ): Promise<number>;
}
