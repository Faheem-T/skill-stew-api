import { Admin } from "../../domain/entities/Admin";
import { AdminSchemaType } from "../db/schemas/adminSchema";

export class AdminMapper {
  static toDomain(raw: AdminSchemaType): Admin {
    const { username, id, password_hash } = raw;
    return new Admin(username, password_hash, id);
  }

  static toPersistence(
    admin: Admin,
  ): AdminSchemaType | Omit<AdminSchemaType, "id"> {
    const { username, passwordHash, id, avatarKey } = admin;
    // const result: Omit<AdminSchemaType, "id"> = {
    //   password_hash: passwordHash,
    //   username,
    // };
    // if (id) {
    //   return Object.assign({ id }, result);
    // }
    return {
      password_hash: passwordHash,
      id,
      username,
      avatar_key: avatarKey ?? null,
    };
  }
}
