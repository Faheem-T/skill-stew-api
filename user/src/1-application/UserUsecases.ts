import { UserRepository } from "../2-infrastructure/db/UserRepository";

export class UserUsecases {
  constructor(private _userRepo: UserRepository) {}

  getAllUsers = async () => {
    return this._userRepo.getAllUsers();
  };

  blockUser = async (userId: string) => {
    return this._userRepo.blockUser(userId);
  };
  unblockUser = async (userId: string) => {
    return this._userRepo.unblockUser(userId);
  };
}
