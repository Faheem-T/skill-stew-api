import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import { IGetCurrentAdminProfile } from "../../interfaces/admin/IGetCurrentAdminProfile";
import { IStorageService } from "../../ports/IStorageService";

export class GetCurrentAdminProfileUsecase implements IGetCurrentAdminProfile {
  constructor(
    private readonly _adminRepo: IAdminRepository,
    private readonly _storageService: IStorageService,
  ) {}
  exec = async (
    adminId: string,
  ): Promise<{ username: string; role: "ADMIN"; avatarUrl?: string }> => {
    const admin = await this._adminRepo.getAdminById(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    const avatarUrl = admin.avatarKey
      ? this._storageService.getPublicUrl(admin.avatarKey)
      : undefined;

    return {
      username: admin.username,
      role: "ADMIN",
      avatarUrl,
    };
  };
}
