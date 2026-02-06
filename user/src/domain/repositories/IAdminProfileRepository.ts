import { AdminProfile } from "../entities/AdminProfile";
import { IBaseRepository } from "./IBaseRepository";

export interface IAdminProfileRepository extends IBaseRepository<AdminProfile> {
  findByUserId(userId: string): Promise<AdminProfile>;
  updateByUserId(
    userId: string,
    partial: Partial<AdminProfile>,
  ): Promise<AdminProfile>;
}
