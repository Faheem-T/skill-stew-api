import { Client } from "@elastic/elasticsearch";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";

export class UserRepository implements IUserRepository {
  private _indexName = "users";
  constructor(private _es: Client) {}

  save = async (user: User): Promise<void> => {
    const document = this.toPersistance(user);
    await this._es.index({
      index: this._indexName,
      document,
      id: user.id,
    });
  };

  private toPersistance = (user: User) => {
    const location = user.location
      ? { lat: user.location.latitude, lon: user.location.longitude }
      : undefined;
    return {
      ...user,
      location,
    };
  };
}
