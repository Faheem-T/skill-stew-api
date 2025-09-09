import { User } from "../0-domain/entities/User";
import { UserRepository } from "../2-infrastructure/db/UserRepository";
import { GetAllUsersDTO } from "./dtos/GetAllUsersDTO";

export class UserUsecases {
  constructor(private _userRepo: UserRepository) {}

  createDummyUsers = async () => {
    for (const { email, role, isGoogleLogin, isVerified } of dummyUsers) {
      const newUser = new User({ email, isGoogleLogin, role });
      if (isVerified) {
        newUser.verify();
      }
      await this._userRepo.save(newUser);
    }
  };

  getAllUsers = async (dto: GetAllUsersDTO) => {
    return this._userRepo.getAllUsers(dto);
  };

  blockUser = async (userId: string) => {
    return this._userRepo.blockUser(userId);
  };
  unblockUser = async (userId: string) => {
    return this._userRepo.unblockUser(userId);
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
