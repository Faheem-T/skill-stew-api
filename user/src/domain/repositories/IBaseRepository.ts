import { TransactionContext } from "../../types/TransactionContext";

export interface IBaseRepository<TEntity> {
  create(entity: TEntity, tx?: TransactionContext): Promise<TEntity>;
  update(id: string, data: Partial<TEntity>, tx?: TransactionContext): Promise<TEntity>;
  findById(id: string, tx?: TransactionContext): Promise<TEntity>;
  delete(id: string, tx?: TransactionContext): Promise<void>;
}
