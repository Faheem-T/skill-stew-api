import { AdminProfile } from "../../../domain/entities/AdminProfile";
import { User } from "../../../domain/entities/User";
import { IAdminProfileRepository } from "../../../domain/repositories/IAdminProfileRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { CreateAdminDTO } from "../../dtos/admin/CreateAdmin.dto";
import { ICreateAdmin } from "../../interfaces/admin/ICreateAdmin";
import { IHasherService } from "../../ports/IHasherService";
import { v7 as uuidv7 } from "uuid";

export class CreateAdmin implements ICreateAdmin {
  constructor(
    private _userRepo: IUserRepository,
    private _adminProfileRepo: IAdminProfileRepository,
    private _hasherService: IHasherService,
  ) {}

  exec = async ({ email, password }: CreateAdminDTO): Promise<void> => {
    const passwordHash = this._hasherService.hash(password);
    const newAdmin = new User(
      uuidv7(),
      email,
      "ADMIN",
      true,
      false,
      false,
      undefined,
      passwordHash,
    );
    const savedAdmin = await this._userRepo.create(newAdmin);
    const newAdminProfile = new AdminProfile(uuidv7(), savedAdmin.id);
    await this._adminProfileRepo.create(newAdminProfile);
  };
}
