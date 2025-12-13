import { AdminGetUserOutputDTO } from "../../dtos/admin/GetUsers.dto";
import { UpdateUserBlockStatusDTO } from "../../dtos/admin/UpdateUserBlockStatus.dto";

export interface IUpdateUserBlockStatus {
  exec(dto: UpdateUserBlockStatusDTO): Promise<AdminGetUserOutputDTO>;
}
