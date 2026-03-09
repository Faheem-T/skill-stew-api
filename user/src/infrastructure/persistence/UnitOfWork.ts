import { IUnitOfWork } from "../../application/ports/IUnitOfWork";
import { db } from "../../start";
import { TransactionContext } from "../../types/TransactionContext";

export class UnitOfWork implements IUnitOfWork {
  async transact<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return db.transaction(async (tx) => {
      return work(tx);
    });
  }
}
