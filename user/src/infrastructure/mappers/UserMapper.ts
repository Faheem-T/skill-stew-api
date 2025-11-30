import { User } from "../../domain/entities/User";
import { UserTableType } from "../db/schemas/userSchema";
import { Mapper } from "./interfaces/Mapper";

export class UserMapper implements Mapper<User, UserTableType> {
  toDomain(raw: UserTableType): User {
    const {
      id,
      email,
      username,
      timezone,
      social_links,
      phone_number,
      password_hash,
      name,
      languages,
      is_verified,
      is_subscribed,
      avatar_key,
      about,
      is_blocked,
      is_google_login,
      banner_key,
      location,
      created_at,
      updated_at,
    } = raw;

    const user = is_google_login
      ? new User({ email, id, isGoogleLogin: is_google_login })
      : new User({
          email,
          id,
          isGoogleLogin: is_google_login,
          passwordHash: password_hash!,
        });
    if (username) user.username = username;
    if (name) user.name = name;
    if (timezone) user.timezone = timezone;
    user.languages = languages;
    user.socialLinks = social_links;
    if (phone_number) user.phoneNumber = phone_number;
    user.isVerified = is_verified;
    user.isSubscribed = is_subscribed;
    if (avatar_key) user.avatarKey = avatar_key;
    if (about) user.about = about;
    if (is_blocked) user.isBlocked = true;
    if (created_at) user.createdAt = created_at;
    if (updated_at) user.updatedAt = updated_at;
    if (location) user.location = location;
    if (banner_key) user.bannerKey = banner_key;

    return user;
  }
  toPersistence(user: User): UserTableType {
    const result = {
      id: user.id,
      email: user.email,
      about: user.about || null,
      avatar_key: user.avatarKey || null,
      banner_key: user.bannerKey || null,
      is_verified: user.isVerified,
      is_subscribed: user.isSubscribed,
      languages: user.languages,
      name: user.name ?? null,
      username: user.username ?? null,
      password_hash: user.passwordHash ?? null,
      phone_number: user.phoneNumber ?? null,
      social_links: user.socialLinks,
      timezone: user.timezone ?? null,
      is_blocked: user.isBlocked,
      is_google_login: user.isGoogleLogin,
      created_at: user.createdAt ?? new Date(),
      updated_at: user.updatedAt ?? new Date(),
      location: user.location ?? null,
    };
    return result;
  }
  toPersistencePartial(partial: Partial<User>): Partial<UserTableType> {
    const result: Partial<UserTableType> = {};

    if (partial.id !== undefined) result.id = partial.id;
    if (partial.email !== undefined) result.email = partial.email;
    if (partial.about !== undefined) result.about = partial.about ?? null;
    if (partial.avatarKey !== undefined)
      result.avatar_key = partial.avatarKey ?? null;
    if (partial.bannerKey !== undefined)
      result.banner_key = partial.bannerKey ?? null;
    if (partial.isVerified !== undefined)
      result.is_verified = partial.isVerified;
    if (partial.isSubscribed !== undefined)
      result.is_subscribed = partial.isSubscribed;
    if (partial.languages !== undefined) result.languages = partial.languages;
    if (partial.name !== undefined) result.name = partial.name ?? null;
    if (partial.username !== undefined)
      result.username = partial.username ?? null;
    if (partial.passwordHash !== undefined)
      result.password_hash = partial.passwordHash ?? null;
    if (partial.phoneNumber !== undefined)
      result.phone_number = partial.phoneNumber ?? null;
    if (partial.socialLinks !== undefined)
      result.social_links = partial.socialLinks;
    if (partial.timezone !== undefined)
      result.timezone = partial.timezone ?? null;
    if (partial.isBlocked !== undefined) result.is_blocked = partial.isBlocked;
    if (partial.isGoogleLogin !== undefined)
      result.is_google_login = partial.isGoogleLogin;
    if (partial.location !== undefined)
      result.location = partial.location ?? null;
    if (partial.createdAt !== undefined) result.created_at = partial.createdAt;
    if (partial.updatedAt !== undefined) result.updated_at = partial.updatedAt;

    return result;
  }
}
