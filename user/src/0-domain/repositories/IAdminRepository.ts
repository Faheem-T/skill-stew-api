import { Admin } from "../entities/Admin";

export interface IAdminRepository {
  create(admin: Admin): Promise<void>;
  getAdminByUsername(username: string): Promise<Admin | null>;
}
