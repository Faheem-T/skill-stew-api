import { User } from "../entities/User";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<User> {
  findRecommendedUsers(params: {
    languages?: string[];
    location?: { lat: number; lon: number };
    offeredSkills?: string[];
    wantedSkills?: string[];
    radius?: number;
    minShouldMatch?: number | string;
  }): Promise<User[]>;
}
