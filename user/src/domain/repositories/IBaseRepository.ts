export interface IBaseRepository<TEntity> {
  create(entity: TEntity): Promise<TEntity>;
  update(id: string, data: Partial<TEntity>): Promise<TEntity | undefined>;
  findById(id: string): Promise<TEntity | undefined>;
  delete(id: string): Promise<void>;
}
