import { IAdminProfileRepository } from "../../../domain/repositories/IAdminProfileRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { GetCurrentAdminProfileDTO } from "../../dtos/admin/GetCurrentAdminProfile.dto";
import { IGetCurrentAdminProfile } from "../../interfaces/admin/IGetCurrentAdminProfile";
import { IStorageService } from "../../ports/IStorageService";

export class GetCurrentAdminProfile implements IGetCurrentAdminProfile {
  constructor(
    private _userRepo: IUserRepository,
    private _adminProfileRepo: IAdminProfileRepository,
    private _storageService: IStorageService,
  ) {}

  exec = async (adminId: string): Promise<GetCurrentAdminProfileDTO> => {
    const adminInfo = await this._userRepo.findById(adminId);
    const adminProfile = await this._adminProfileRepo.findById(adminId);

    let avatarUrl = undefined;
    if (adminProfile.avatarKey) {
      avatarUrl = this._storageService.getPublicUrl(adminProfile.avatarKey);
    }

    return {
      email: adminInfo.email,
      username: adminInfo.username,
      role: "ADMIN",
      avatarUrl,
    };
  };
}
