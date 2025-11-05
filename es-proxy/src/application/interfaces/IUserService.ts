import { SaveUserDTO, UpdateUserProfileDTO } from "../dtos/UserDTO";

export interface IUserService {
  save(dto: SaveUserDTO): Promise<void>;
  verifyUser(id: string): Promise<void>;
  updateUserProfile(dto: UpdateUserProfileDTO): Promise<void>;
}
