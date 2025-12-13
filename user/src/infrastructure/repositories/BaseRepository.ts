import { PgTableWithColumns } from "drizzle-orm/pg-core";
import { IBaseRepository } from "../../domain/repositories/IBaseRepository";
import { db } from "../../start";
import { eq, InferInsertModel, InferSelectModel } from "drizzle-orm";
import { Mapper } from "../mappers/interfaces/Mapper";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { mapDrizzleError } from "../mappers/ErrorMapper";

export abstract class BaseRepository<
  TEntity,
  TTable extends PgTableWithColumns<any>,
  TPersistence = InferSelectModel<TTable>,
> implements IBaseRepository<TEntity> {
  constructor(protected table: TTable) {}

  protected abstract mapper: Mapper<TEntity, TPersistence>;

  create = async (entity: TEntity): Promise<TEntity> => {
    try {
      const data = this.mapper.toPersistence(entity);
      const [row] = await db.insert(this.table).values(data).returning();
      return this.mapper.toDomain(row as TPersistence);
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  update = async (id: string, partial: Partial<TEntity>): Promise<TEntity> => {
    const data = this.mapper.toPersistencePartial(
      partial,
    ) as InferInsertModel<TTable>;
    let row;
    try {
      const rows = (await db
        .update(this.table)
        .set(data)
        .where(eq(this.table.id, id))
        .returning()) as any;
      row = rows[0];
    } catch (err) {
      throw mapDrizzleError(err);
    }

    if (!row) {
      throw new NotFoundError("");
    }

    return this.mapper.toDomain(row as TPersistence);
  };

  delete = async (id: string): Promise<void> => {
    try {
      await db.delete(this.table).where(eq(this.table.id, id));
    } catch (err) {
      throw mapDrizzleError(err);
    }
  };

  findById = async (id: string): Promise<TEntity> => {
    let row;
    try {
      const rows = await db
        .select()
        .from(this.table as any)
        .where(eq(this.table.id, id));
      row = rows[0];
    } catch (err) {
      throw mapDrizzleError(err);
    }

    if (!row) {
      throw new NotFoundError("");
    }

    return this.mapper.toDomain(row);
  };
}
