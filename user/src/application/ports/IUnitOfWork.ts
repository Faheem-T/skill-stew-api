import { TransactionContext } from "../../types/TransactionContext";

export interface IUnitOfWork {
  transact<T>(work: (tx: TransactionContext) => Promise<T>): Promise<T>;
}
