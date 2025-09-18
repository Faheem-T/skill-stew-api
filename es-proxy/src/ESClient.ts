import { Client } from "@elastic/elasticsearch";
import { logger } from "./utils/logger/index.js";
import { User } from "./types/User.js";

export class ESClient {
  private _indexes = ["users", "skills"] as const;
  private _initialized: boolean;

  constructor(private _es: Client) {
    this._initialized = false;
  }

  init = async () => {
    if (this._initialized) return;
    for (const index of this._indexes) {
      try {
        await this._es.indices.create({ index });
      } catch (err) {
        const e = err as any;
        if (e.meta.body.error.type === "resource_already_exists_exception") {
          logger.info("Index not created as it already exists");
        } else {
          logger.error(e);
          throw e;
        }
      }
    }
    this._initialized = true;
  };

  index = async (
    index: (typeof this._indexes)[number],
    document: any,
    id?: string,
  ) => {
    if (!this._initialized) {
      throw new Error("ES client is not initialized");
    }
    await this._es.index({ index, document, id });
    // await this._es.indices.delete({ index });
  };

  search = async (index: (typeof this._indexes)[number]): Promise<User[]> => {
    if (!this._initialized) {
      throw new Error("ES client is not initialized");
    }
    const response = await this._es.search<User>({ index });
    return response.hits.hits.map((user) => user._source!);
  };

  updateUser = async (id: string, doc: any) => {
    const index: (typeof this._indexes)[number] = "users";
    this._es.update({ id, index, doc });
  };
}
