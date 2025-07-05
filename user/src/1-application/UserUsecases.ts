import { User } from "../0-domain/entities/User";
import { IUserRepository } from "../0-domain/repositories/IUserRepository";

export class UserUsecases {
  constructor(private UserRepo: IUserRepository) {}

  getAllUsers = async () => {
    return this.UserRepo.getAllUsers();
  };

  getUserById = async (id: number) => {
    return this.UserRepo.getUserById(id);
  };

  registerUser = async (email: string) => {
    const user = new User(email);
    await this.UserRepo.save(user);
  };

  verifyUser = async (userId: number) => {};

  setUserPassword = async (password: string) => {};

  updateUserDetails = async (user: User) => {};
}
