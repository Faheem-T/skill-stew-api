import { IAdminRepository } from "../../../domain/repositories/IAdminRepository";
import { IGetCurrentAdminProfile } from "../../interfaces/admin/IGetCurrentAdminProfile";

export class GetCurrentAdminProfileUsecase implements IGetCurrentAdminProfile {
  constructor(private _adminRepo: IAdminRepository) {}
  exec = async (
    adminId: string,
  ): Promise<{ username: string; role: "ADMIN" }> => {
    const admin = await this._adminRepo.getAdminById(adminId);
    if (!admin) {
      throw new Error("Admin not found");
    }
    return { username: admin.username, role: "ADMIN" };
  };
}
