import { Client } from "@elastic/elasticsearch";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { logger } from "../../../utils/logger";

export class UserRepository implements IUserRepository {
  private _indexName = "users";
  constructor(private _es: Client) {}

  save = async (user: User): Promise<void> => {
    await this._es.index({
      index: this._indexName,
      document: user,
      id: user.id,
    });
  };
}
