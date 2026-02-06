export interface IBaseRepository<TEntity> {
  create(entity: TEntity): Promise<TEntity>;
  update(id: string, data: Partial<TEntity>): Promise<TEntity>;
  findById(id: string): Promise<TEntity>;
  delete(id: string): Promise<void>;
}
