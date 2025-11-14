import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import {
  SaveUserDTO,
  UpdateUserProfileDTO,
  UpdateUserSkillProfileDTO,
} from "../dtos/UserDTO";
import { IUserService } from "../interfaces/IUserService";

export class UserService implements IUserService {
  constructor(private _userRepo: IUserRepository) {}
  create = async (dto: SaveUserDTO): Promise<void> => {
    const user = new User(dto.id);
    await this._userRepo.create(user.id, user);
  };

  verifyUser = async (id: string): Promise<void> => {
    const user = new User(id);
    user.isVerified = true;
    await this._userRepo.update(id, user);
  };

  updateUserProfile = async (dto: UpdateUserProfileDTO): Promise<void> => {
    const { id, languages, location, name, username } = dto;

    const user = new User(id);
    user.name = name;
    user.username = username;
    user.location = location;
    user.languages = languages;

    await this._userRepo.update(id, user);
  };
  updateUserSkillProfile = async (
    dto: UpdateUserSkillProfileDTO,
  ): Promise<void> => {
    const { id, offeredSkills, wantedSkills } = dto;
    const user = new User(id);
    user.offeredSkills = offeredSkills;
    user.wantedSkills = wantedSkills;
    await this._userRepo.update(id, user);
  };
}
