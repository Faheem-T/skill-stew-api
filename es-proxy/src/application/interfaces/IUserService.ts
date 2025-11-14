import {
  SaveUserDTO,
  UpdateUserProfileDTO,
  UpdateUserSkillProfileDTO,
} from "../dtos/UserDTO";

export interface IUserService {
  create(dto: SaveUserDTO): Promise<void>;
  verifyUser(id: string): Promise<void>;
  updateUserProfile(dto: UpdateUserProfileDTO): Promise<void>;
  updateUserSkillProfile(dto: UpdateUserSkillProfileDTO): Promise<void>;
}
