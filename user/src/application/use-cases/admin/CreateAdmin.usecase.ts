import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ICreateAdmin } from "../../interfaces/admin/ICreateAdmin";
import { IHasherService } from "../../ports/IHasherService";
import { v7 as uuidv7 } from "uuid";

export class CreateAdmin implements ICreateAdmin {
  constructor(
    private _userRepo: IUserRepository,
    private _hasherService: IHasherService,
  ) {}

  exec = async (username: string, password: string): Promise<void> => {
    const passwordHash = this._hasherService.hash(password);
    const newAdmin = new User(
      uuidv7(),
      "email",
      "ADMIN",
      true,
      false,
      false,
      username,
      passwordHash,
    );
    await this._userRepo.create(newAdmin);
  };
}
