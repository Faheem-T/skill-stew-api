import { AdminProfile } from "../../domain/entities/AdminProfile";
import { AdminProfileTableType } from "../db/schemas/adminProfileSchema";
import { Mapper } from "./interfaces/Mapper";

export class AdminProfileMapper implements Mapper<
  AdminProfile,
  AdminProfileTableType
> {
  toDomain(raw: AdminProfileTableType): AdminProfile {
    const { id, user_id, avatar_key, name, created_at, updated_at } = raw;

    return new AdminProfile(
      id,
      user_id,
      name ?? undefined,
      avatar_key ?? undefined,
      created_at,
      updated_at ?? undefined,
    );
  }

  toPersistence(entity: AdminProfile): AdminProfileTableType {
    const { id, userId, name, avatarKey, createdAt, updatedAt } = entity;

    return {
      id,
      user_id: userId,
      avatar_key: avatarKey ?? null,
      name: name ?? null,
      created_at: createdAt ?? new Date(),
      updated_at: updatedAt ?? new Date(),
    };
  }

  toPersistencePartial(
    partial: Partial<AdminProfile>,
  ): Partial<AdminProfileTableType> {
    const { id, userId, name, avatarKey, createdAt, updatedAt } = partial;

    const result: Partial<AdminProfileTableType> = {};
    if (id !== undefined) result.id = id;
    if (userId !== undefined) result.user_id = userId;
    if (name !== undefined) result.name = name;
    if (avatarKey !== undefined) result.avatar_key = avatarKey;
    if (createdAt !== undefined) result.created_at = createdAt;
    if (updatedAt !== undefined) result.updated_at = updatedAt;

    return result;
  }
}
