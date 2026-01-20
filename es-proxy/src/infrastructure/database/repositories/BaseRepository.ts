import { Client } from "@elastic/elasticsearch";
import { Mapper } from "../../mappers/interfaces/Mapper";
import { IBaseRepository } from "../../../domain/repositories/IBaseRepository";

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
    const document = this.mapper.toPersistence(entity);
    await this._es.index({
      index: this._indexName,
      document,
      id,
    });
  };

  update = async (id: string, entity: Partial<TEntity>): Promise<void> => {
    const document = this.mapper.toPersistencePartial(entity);
    await this._es.update({
      index: this._indexName,
      id,
      doc: document,
    });
  };

  delete = async (id: string): Promise<void> => {
    await this._es.delete({ index: this._indexName, id });
  };

  findById = async (id: string): Promise<TEntity> => {
    const document = await this._es.get<TPersistence>({
      index: this._indexName,
      id,
    });
    if (!document.found || !document._source) {
      throw new Error("Document not found");
    }
    return this.mapper.toDomain(document._source);
  };
}
