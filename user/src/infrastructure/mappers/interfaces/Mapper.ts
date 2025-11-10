export interface Mapper<TEntity, TPersistence> {
  toDomain(raw: TPersistence): TEntity;
  toPersistence(entity: TEntity): TPersistence;
  toPersistencePartial(partial: Partial<TEntity>): Partial<TPersistence>;
}
