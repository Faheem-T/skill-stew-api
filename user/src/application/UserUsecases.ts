import { User } from "../domain/entities/User";
import { IUserRepository } from "../domain/repositories/IUserRepository";
import { GetAllUsersInputDTO, PresentationUser } from "./dtos/GetAllUsersDTO";
import { UpdateProfileDTO } from "./dtos/UpdateProfileDTO";
import { IUserUsecases } from "./interfaces/IUserUsecases";
import { UserDTOMapper } from "./mappers/UserDTOMapper";

export class UserUsecases implements IUserUsecases {
  constructor(private _userRepo: IUserRepository) {}

  createDummyUsers = async () => {
    for (const { email, isVerified } of dummyUsers) {
      const newUser = new User({
        email,
        isGoogleLogin: false,
        passwordHash: "password",
      });
      if (isVerified) {
        newUser.isVerified = true;
      }
      await this._userRepo.create(newUser);
    }
  };

  getAllUsers = async (dto: GetAllUsersInputDTO) => {
    const { users, hasNextPage, nextCursor } =
      await this._userRepo.getAllUsers(dto);
    const parsedUsers: PresentationUser[] = users.map(
      UserDTOMapper.toPresentation,
    );
    return {
      users: parsedUsers,
      hasNextPage,
      nextCursor,
    };
  };

  blockUser = async (userId: string) => {
    const user = await this._userRepo.update(userId, { isBlocked: true });
    if (!user) return null;
    return UserDTOMapper.toPresentation(user);
  };
  unblockUser = async (userId: string) => {
    const user = await this._userRepo.update(userId, { isBlocked: false });
    if (!user) return null;
    return UserDTOMapper.toPresentation(user);
  };

  updateProfile = async (
    dto: UpdateProfileDTO,
  ): Promise<PresentationUser | null> => {
    const {
      id,
      name,
      username,
      about,
      avatarKey,
      location,
      languages,
      phoneNumber,
      socialLinks,
      timezone,
    } = dto;
    const user: Partial<User> = {
      id,
      name,
      username,
      about,
      avatarKey,
      location,
      languages,
      phoneNumber,
      socialLinks,
      timezone,
    };
    const savedUser = await this._userRepo.update(id, user);
    if (!savedUser) return null;
    return UserDTOMapper.toPresentation(savedUser);
  };
}
const dummyUsers: {
  email: string;
  role: "USER";
  isVerified: boolean;
}[] = Array.from({ length: 100 }, (_, i) => ({
  email: `anotheruser${i + 1}@example.com`,
  role: "USER",
  isVerified: Math.random() > 0.5,
}));
