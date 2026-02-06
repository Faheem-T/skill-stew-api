import { User } from "../../domain/entities/User";
import { UserTableType } from "../db/schemas/userSchema";
import { Mapper } from "./interfaces/Mapper";

export class UserMapper implements Mapper<User, UserTableType> {
  toDomain(raw: UserTableType): User {
    const {
      id,
      email,
      role,
      username,
      password_hash,
      is_verified,
      is_blocked,
      is_google_login,
      created_at,
      updated_at,
    } = raw;

    return new User(
      id,
      email,
      role,
      is_verified,
      is_blocked,
      is_google_login,
      username ?? undefined,
      password_hash ?? undefined,
      created_at,
      updated_at ?? undefined,
    );
  }
  toPersistence(user: User): UserTableType {
    const {
      id,
      email,
      isVerified,
      role,
      isBlocked,
      isGoogleLogin,
      passwordHash = null,
      username = null,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = user;
    const result = {
      id: id,
      email: email,
      is_verified: isVerified,
      role,
      username,
      password_hash: passwordHash,
      is_blocked: isBlocked,
      is_google_login: isGoogleLogin,
      created_at: createdAt,
      updated_at: updatedAt,
    };
    return result;
  }
  toPersistencePartial(partial: Partial<User>): Partial<UserTableType> {
    const {
      id,
      email,
      isVerified,
      role,
      isBlocked,
      isGoogleLogin,
      passwordHash,
      username,
      createdAt,
      updatedAt,
    } = partial;

    const result: Partial<UserTableType> = {};

    if (id !== undefined) result.id = id;
    if (email !== undefined) result.email = email;
    if (isVerified !== undefined) result.is_verified = isVerified;
    if (role !== undefined) result.role = role;
    if (username !== undefined) result.username = username ?? null;
    if (passwordHash !== undefined) result.password_hash = passwordHash ?? null;
    if (isBlocked !== undefined) result.is_blocked = isBlocked;
    if (isGoogleLogin !== undefined) result.is_google_login = isGoogleLogin;
    if (createdAt !== undefined) result.created_at = createdAt;
    if (updatedAt !== undefined) result.updated_at = updatedAt;

    return result;
  }
}
