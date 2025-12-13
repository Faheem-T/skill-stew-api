import {
  UpdateProfileDTO,
  UpdateProfileOutputDTO,
} from "../../dtos/user/UpdateUserProfile.dto";

export interface IUpdateUserProfile {
  exec(dto: UpdateProfileDTO): Promise<UpdateProfileOutputDTO>;
}
