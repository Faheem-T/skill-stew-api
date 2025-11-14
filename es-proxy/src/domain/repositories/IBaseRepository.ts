export interface IBaseRepository<TEntity> {
  create(id: string, entity: TEntity): Promise<void>;
  update(id: string, entity: Partial<TEntity>): Promise<void>;
  delete(id: string): Promise<void>;
}
