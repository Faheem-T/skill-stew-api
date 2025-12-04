import { User } from "../../domain/entities/User";
import { PresentationUser } from "../dtos/GetAllUsersDTO";

export class UserDTOMapper {
  static toPresentation(user: User): PresentationUser {
    return {
      id: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
      is_verified: user.isVerified,
      is_blocked: user.isBlocked,
      created_at: user.createdAt!,
      updated_at: user.updatedAt!,
    };
  }
}
