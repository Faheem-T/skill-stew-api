import { AdminProfile } from "../entities/AdminProfile";
import { IBaseRepository } from "./IBaseRepository";
import { TransactionContext } from "../../types/TransactionContext";

export interface IAdminProfileRepository extends IBaseRepository<AdminProfile> {
  findByUserId(userId: string, tx?: TransactionContext): Promise<AdminProfile>;
  updateByUserId(
    userId: string,
    partial: Partial<AdminProfile>,
    tx?: TransactionContext,
  ): Promise<AdminProfile>;
}
