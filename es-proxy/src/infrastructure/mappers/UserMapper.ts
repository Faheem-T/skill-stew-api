import { User } from "../../domain/entities/User";
import { UserDoc } from "../database/repositories/UserRepository";
import { Mapper } from "./interfaces/Mapper";

export class UserMapper implements Mapper<User, UserDoc> {
  constructor() {}

  toPersistence(entity: User) {
    const location = entity.location
      ? { lat: entity.location.latitude, lon: entity.location.longitude }
      : undefined;

    const formattedAddress = entity.location
      ? entity.location.formattedAddress
      : undefined;

    return {
      ...entity,
      location,
      formattedAddress,
    };
  }

  toDomain(raw: UserDoc) {
    const {
      id,
      name,
      username,
      location,
      formattedAddress,
      isVerified,
      languages,
      offeredSkills,
      wantedSkills,
    } = raw;
    const user = new User(id);
    user.name = name;
    user.username = username;
    if (location && formattedAddress) {
      user.location = {
        latitude: location.lat,
        longitude: location.lon,
        formattedAddress,
      };
    }
    user.isVerified = isVerified;
    user.languages = languages;
    user.offeredSkills = offeredSkills;
    user.wantedSkills = wantedSkills;
    return user;
  }

  toPersistencePartial(partial: Partial<User>) {
    const location = partial.location
      ? { lat: partial.location.latitude, lon: partial.location.longitude }
      : undefined;

    const formattedAddress = partial.location
      ? partial.location.formattedAddress
      : undefined;

    return {
      ...partial,
      location,
      formattedAddress,
    };
  }
}
