import { Client } from "@elastic/elasticsearch";
import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { BaseRepository } from "./BaseRepository";
import { Mapper } from "../../mappers/interfaces/Mapper";

export class UserRepository
  extends BaseRepository<User, any>
  implements IUserRepository
{
  constructor(es: Client) {
    super("users", es);
  }

  protected mapper: Mapper<User, any> = {
    toPersistence(entity) {
      const location = entity.location
        ? { lat: entity.location.latitude, lon: entity.location.longitude }
        : undefined;
      return {
        ...entity,
        location,
      };
    },

    toDomain(raw: any) {
      const {} = raw;
      const user = new User(raw.id);
      return user;
    },

    toPersistencePartial(partial) {
      const location = partial.location
        ? { lat: partial.location.latitude, lon: partial.location.longitude }
        : undefined;
      return {
        ...partial,
        location,
      };
    },
  };
}
