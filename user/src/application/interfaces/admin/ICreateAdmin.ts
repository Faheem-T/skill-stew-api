import { CreateAdminDTO } from "../../dtos/admin/CreateAdmin.dto";

export interface ICreateAdmin {
  exec(dto: CreateAdminDTO): Promise<void>;
}
