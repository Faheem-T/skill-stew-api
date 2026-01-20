import { Client } from "@elastic/elasticsearch";
import { Mapper } from "../../mappers/interfaces/Mapper";
import { IBaseRepository } from "../../../domain/repositories/IBaseRepository";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { mapESError } from "../../mappers/ErrorMapper";

export abstract class BaseRepository<
  TEntity,
  TPersistence,
> implements IBaseRepository<TEntity> {
  constructor(
    protected _indexName: string,
    protected _es: Client,
  ) {}

  protected abstract mapper: Mapper<TEntity, TPersistence>;

  create = async (id: string, entity: TEntity): Promise<void> => {
    try {
      const document = this.mapper.toPersistence(entity);
      await this._es.index({
        index: this._indexName,
        document,
        id,
      });
    } catch (err) {
      throw mapESError(err);
    }
  };

  update = async (id: string, entity: Partial<TEntity>): Promise<void> => {
    try {
      const document = this.mapper.toPersistencePartial(entity);
      await this._es.update({
        index: this._indexName,
        id,
        doc: document,
      });
    } catch (err) {
      throw mapESError(err);
    }
  };

  delete = async (id: string): Promise<void> => {
    try {
      await this._es.delete({ index: this._indexName, id });
    } catch (err) {
      throw mapESError(err);
    }
  };

  findById = async (id: string): Promise<TEntity> => {
    try {
      const document = await this._es.get<TPersistence>({
        index: this._indexName,
        id,
      });
      if (!document.found || !document._source) {
        throw new NotFoundError(this.getEntityName());
      }
      return this.mapper.toDomain(document._source);
    } catch (err) {
      // If it's our NotFoundError, rethrow it
      if (err instanceof NotFoundError) {
        throw err;
      }
      // Otherwise map as Elasticsearch error
      throw mapESError(err);
    }
  };

  // Helper method to be overridden by subclasses for more specific entity names
  protected getEntityName(): string {
    return "Document";
  };
}
