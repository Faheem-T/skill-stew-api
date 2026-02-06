export interface Mapper<TEntity, TPersistence> {
  toPersistence(entity: TEntity): TPersistence;
  toDomain(raw: TPersistence): TEntity;
  toPersistencePartial(partial: Partial<TEntity>): Partial<TPersistence>;
}
