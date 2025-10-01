import { User } from "../../domain/entities/User";
import { UserSchemaType } from "../db/schemas/userSchema";

export class UserMapper {
  static toDomain(raw: UserSchemaType): User {
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
      avatar_url,
      about,
      is_blocked,
      is_google_login,
      created_at,
      updated_at,
    } = raw;
    const user = new User({ email, id, isGoogleLogin: is_google_login });
    if (username) user.username = username;
    if (name) user.name = name;
    if (timezone) user.timezone = timezone;
    user.languages = languages;
    user.socialLinks = social_links;
    if (phone_number) user.phoneNumber = phone_number;
    if (password_hash) user.passwordHash = password_hash;
    user.isVerified = is_verified;
    user.isSubscribed = is_subscribed;
    if (avatar_url) user.avatarUrl = avatar_url;
    if (about) user.about = about;
    if (is_blocked) user.isBlocked = true;
    if (created_at) user.createdAt = created_at;
    if (updated_at) user.updatedAt = updated_at;

    return user;
  }
  static toPersistence(
    user: User,
  ): UserSchemaType | Omit<UserSchemaType, "id"> {
    const result: Omit<UserSchemaType, "id"> = {
      email: user.email,
      about: user.about || null,
      avatar_url: user.avatarUrl || null,
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
    };
    if (user.id) {
      return Object.assign({ id: user.id }, result);
    }
    return result;
  }
}
