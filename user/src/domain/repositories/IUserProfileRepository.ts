import { UserProfile } from "../entities/UserProfile";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserProfileRepository extends IBaseRepository<UserProfile> {
  findByUserId(userId: string): Promise<UserProfile>;
  updateByUserId(
    userId: string,
    partial: Partial<UserProfile>,
  ): Promise<UserProfile>;
}
