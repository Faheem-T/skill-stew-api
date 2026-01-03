import { GetCurrentAdminProfileDTO } from "../../dtos/admin/GetCurrentAdminProfile.dto";

export interface IGetCurrentAdminProfile {
  exec(adminId: string): Promise<GetCurrentAdminProfileDTO>;
}
