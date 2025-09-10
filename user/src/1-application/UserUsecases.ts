import { User } from "../0-domain/entities/User";
import { IUserRepository } from "../0-domain/repositories/IUserRepository";
import { GetAllUsersInputDTO, PresentationUser } from "./dtos/GetAllUsersDTO";
import { IUserUsecases } from "./interfaces/IUserUsecases";
import { UserDTOMapper } from "./mappers/UserDTOMapper";

export class UserUsecases implements IUserUsecases {
  constructor(private _userRepo: IUserRepository) {}

  createDummyUsers = async () => {
    for (const { email, isGoogleLogin, isVerified } of dummyUsers) {
      const newUser = new User({ email, isGoogleLogin });
      if (isVerified) {
        newUser.isVerified = true;
      }
      await this._userRepo.save(newUser);
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
    const user = await this._userRepo.blockUser(userId);
    if (!user) return null;
    return UserDTOMapper.toPresentation(user);
  };
  unblockUser = async (userId: string) => {
    const user = await this._userRepo.unblockUser(userId);
    if (!user) return null;
    return UserDTOMapper.toPresentation(user);
  };
}
const dummyUsers: {
  email: string;
  role: "USER";
  isGoogleLogin: boolean;
  isVerified: boolean;
}[] = Array.from({ length: 100 }, (_, i) => ({
  email: `anotheruser${i + 1}@example.com`,
  role: "USER",
  isGoogleLogin: Math.random() > 0.5,
  isVerified: Math.random() > 0.5,
}));
