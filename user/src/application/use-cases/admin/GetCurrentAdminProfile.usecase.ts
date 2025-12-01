import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import { IGetCurrentAdminProfile } from "../../interfaces/admin/IGetCurrentAdminProfile";

export class GetCurrentAdminProfileUsecase implements IGetCurrentAdminProfile {
  constructor(private _adminRepo: IAdminRepository) {}
  exec = async (
    adminId: string,
  ): Promise<{ username: string; role: "ADMIN"; avatarUrl?: string }> => {
    const admin = await this._adminRepo.getAdminById(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // TODO: turn avatarKey -> avatarUr

    return {
      username: admin.username,
      role: "ADMIN",
      avatarUrl: admin.avatarKey,
    };
  };
}
