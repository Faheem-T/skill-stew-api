import {
  GetUserProfileDTO,
  GetUserProfileOutputDTO,
} from "../../dtos/user/GetUserProfile.dto";

export interface IGetUserProfile {
  exec(dto: GetUserProfileDTO): Promise<GetUserProfileOutputDTO>;
}
