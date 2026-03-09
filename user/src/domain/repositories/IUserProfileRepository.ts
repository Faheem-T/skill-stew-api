import { UserProfile } from "../entities/UserProfile";
import { IBaseRepository } from "./IBaseRepository";
import { TransactionContext } from "../../types/TransactionContext";

export interface IUserProfileRepository extends IBaseRepository<UserProfile> {
  findByUserId(userId: string, tx?: TransactionContext): Promise<UserProfile>;
  updateByUserId(
    userId: string,
    partial: Partial<UserProfile>,
    tx?: TransactionContext,
  ): Promise<UserProfile>;
}
