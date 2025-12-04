import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { GetAllUsersInputDTO, PresentationUser } from "../dtos/GetAllUsersDTO";
import { IUserUsecases } from "../interfaces/IUserUsecases";
import { UserDTOMapper } from "../mappers/UserDTOMapper";

export class UserUsecases implements IUserUsecases {
  constructor(private _userRepo: IUserRepository) {}

  getAllUsers = async (dto: GetAllUsersInputDTO) => {
    const { users, hasNextPage, nextCursor } =
      await this._userRepo.findAll(dto);
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
