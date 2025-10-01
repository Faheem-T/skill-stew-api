import { User } from "../../domain/entities/User";
import { PresentationUser } from "../dtos/GetAllUsersDTO";

export class UserDTOMapper {
  static toPresentation(user: User): PresentationUser {
    return {
      id: user.id!,
      role: user.role,
      name: user.name,
      username: user.username,
      email: user.email,
      phone_number: user.phoneNumber,
      avatar_url: user.avatarUrl,
      timezone: user.timezone,
      about: user.about,
      social_links: user.socialLinks,
      languages: user.languages,
      is_subscribed: user.isSubscribed,
      is_verified: user.isVerified,
      is_blocked: user.isBlocked,
      created_at: user.createdAt!,
      updated_at: user.updatedAt!,
    };
  }
}
