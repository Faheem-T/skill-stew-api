import { GetCurrentUserProfileDTO } from "../../dtos/user/GetCurrentUserProfile.dto";

export interface IGetCurrentUserProfile {
  exec(id: string): Promise<GetCurrentUserProfileDTO>;
}
