import { PresentationUser } from "../../dtos/GetAllUsersDTO";
import { UpdateProfileDTO } from "../../dtos/user/UpdateProfileDTO";

export interface IUserProfileUpdate {
  exec(dto: UpdateProfileDTO): Promise<PresentationUser | null>;
}
