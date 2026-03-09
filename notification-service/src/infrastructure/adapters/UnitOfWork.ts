import mongoose from "mongoose";
import type { IUnitOfWork } from "../../application/ports/IUnitOfWork";
import type { TransactionContext } from "../../types/TransactionContext";

export class UnitOfWork implements IUnitOfWork {
  async transact<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return mongoose.connection.transaction(async (tx) => {
      return work(tx);
    });
  }
}
