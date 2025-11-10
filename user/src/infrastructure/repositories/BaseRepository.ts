import { PgTableWithColumns } from "drizzle-orm/pg-core";
import { IBaseRepository } from "../../domain/repositories/IBaseRepository";
import { db } from "../../start";
import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { Mapper } from "../mappers/interfaces/Mapper";

export abstract class BaseRepository<
  TEntity,
  TTable extends PgTableWithColumns<any>,
  TPersistence = InferSelectModel<TTable>,
> implements IBaseRepository<TEntity>
{
  constructor(protected table: TTable) {}

  protected abstract mapper: Mapper<TEntity, TPersistence>;

  create = async (entity: TEntity): Promise<TEntity> => {
    const data = this.mapper.toPersistence(entity);
    const [row] = await db.insert(this.table).values(data).returning();
    return this.mapper.toDomain(row as TPersistence);
  };

  update = async (
    id: string,
    partial: Partial<TEntity>,
  ): Promise<TEntity | undefined> => {
    const data = this.mapper.toPersistencePartial(
      partial,
    ) as InferInsertModel<TTable>;
    const [row] = (await db
      .update(this.table)
      .set(data)
      .where(eq(this.table.id, id))
      .returning()) as any;

    return this.mapper.toDomain(row as TPersistence);
  };

  delete = async (id: string): Promise<void> => {
    await db.delete(this.table).where(eq(this.table.id, id));
  };

  findById = async (id: string): Promise<TEntity | undefined> => {
    const [row] = await db
      .select()
      .from(this.table as any)
      .where(eq(this.table.id, id));
    return row ? this.mapper.toDomain(row) : undefined;
  };
}
