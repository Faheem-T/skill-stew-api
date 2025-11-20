import { PresentationUser } from "../../dtos/GetAllUsersDTO";
import { UpdateProfileDTO } from "../../dtos/user/UpdateUserProfile.dto";

export interface IUpdateUserProfile {
  exec(dto: UpdateProfileDTO): Promise<PresentationUser | null>;
}
