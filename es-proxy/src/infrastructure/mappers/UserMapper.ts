import { User } from "../../domain/entities/User";
import { UserDoc } from "../database/repositories/UserRepository";
import { Mapper } from "./interfaces/Mapper";

export class UserMapper implements Mapper<User, UserDoc> {
  constructor() {}

  toPersistence(entity: User) {
    const location = entity.location
      ? { lat: entity.location.latitude, lon: entity.location.longitude }
      : undefined;
    return {
      ...entity,
      location,
    };
  }

  toDomain(raw: UserDoc) {
    const {} = raw;
    const user = new User(raw.id);
    return user;
  }

  toPersistencePartial(partial: Partial<User>) {
    const location = partial.location
      ? { lat: partial.location.latitude, lon: partial.location.longitude }
      : undefined;
    return {
      ...partial,
      location,
    };
  }
}
