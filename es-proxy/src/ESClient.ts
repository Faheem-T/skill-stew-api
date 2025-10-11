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
        if (e.meta?.body?.error?.type === "resource_already_exists_exception") {
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
  };

  search = async (index: (typeof this._indexes)[number]): Promise<User[]> => {
    if (!this._initialized) {
      throw new Error("ES client is not initialized");
    }
    const response = await this._es.search<User>({ index });
    return response.hits.hits.map((user) => user._source!);
  };

  updateUser = async (
    id: string,
    doc: any,
    maxRetries = 5,
    initialDelay = 50,
  ) => {
    let attempt = 0;
    const index: (typeof this._indexes)[number] = "users";

    while (attempt < maxRetries) {
      try {
        await this._es.update({ id, index, doc });
        logger.info(`Update succeeded on attempt #${attempt}`);
        return;
      } catch (err: any) {
        if (err.meta?.status === 404) {
          attempt++;
          if (attempt >= maxRetries) {
            logger.error(`Update failed after ${maxRetries} attempts`);
            throw err;
          }

          const delay = initialDelay * Math.pow(2, attempt - 1);
          logger.warn(`Doc not found. Retrying in ${delay} ms`);
          await new Promise((res) => {
            setTimeout(res, delay);
          });
        }
      }
    }
  };
}
