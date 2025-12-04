import { UserProfile } from "../../domain/entities/UserProfile";
import { UserProfileTableType } from "../db/schemas/userProfileSchema";
import { Mapper } from "./interfaces/Mapper";

export class UserProfileMapper implements Mapper<
  UserProfile,
  UserProfileTableType
> {
  toDomain(raw: UserProfileTableType): UserProfile {
    const {
      id,
      user_id,
      is_subscribed,
      about,
      avatar_key,
      banner_key,
      languages,
      location,
      name,
      phone_number,
      social_links,
      timezone,
      created_at,
      updated_at,
    } = raw;
    return new UserProfile(
      id,
      user_id,
      is_subscribed,
      name ?? undefined,
      phone_number ?? undefined,
      avatar_key ?? undefined,
      banner_key ?? undefined,
      timezone ?? undefined,
      about ?? undefined,
      social_links ?? undefined,
      languages ?? undefined,
      location ?? undefined,
      created_at,
      updated_at ?? undefined,
    );
  }

  toPersistence(entity: UserProfile): UserProfileTableType {
    const {
      id,
      userId,
      isSubscribed,
      name = null,
      phoneNumber = null,
      avatarKey = null,
      bannerKey = null,
      timezone = null,
      about = null,
      socialLinks = [],
      languages = [],
      location = null,
      createdAt = new Date(),
      updatedAt = new Date(),
    } = entity;

    return {
      id,
      user_id: userId,
      is_subscribed: isSubscribed,
      name,
      phone_number: phoneNumber,
      avatar_key: avatarKey,
      banner_key: bannerKey,
      timezone,
      about,
      social_links: socialLinks,
      languages,
      location,
      created_at: createdAt,
      updated_at: updatedAt,
    };
  }

  toPersistencePartial(
    partial: Partial<UserProfile>,
  ): Partial<UserProfileTableType> {
    const {
      id,
      userId,
      isSubscribed,
      name,
      phoneNumber,
      avatarKey,
      bannerKey,
      timezone,
      about,
      socialLinks,
      languages,
      location,
      createdAt,
      updatedAt,
    } = partial;

    const result: Partial<UserProfileTableType> = {};
    if (id !== undefined) result.id = id;
    if (userId !== undefined) result.user_id = userId;
    if (isSubscribed !== undefined) result.is_subscribed = isSubscribed;
    if (name !== undefined) result.name = name;
    if (phoneNumber !== undefined) result.phone_number = phoneNumber;
    if (avatarKey !== undefined) result.avatar_key = avatarKey;
    if (bannerKey !== undefined) result.banner_key = bannerKey;
    if (timezone !== undefined) result.timezone = timezone;
    if (about !== undefined) result.about = about;
    if (socialLinks !== undefined) result.social_links = socialLinks;
    if (languages !== undefined) result.languages = languages;
    if (location !== undefined) result.location = location;
    if (createdAt !== undefined) result.created_at = createdAt;
    if (updatedAt !== undefined) result.updated_at = updatedAt;

    return result;
  }
}
