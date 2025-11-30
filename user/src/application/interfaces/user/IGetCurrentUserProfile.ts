import { GetCurrentUserProfileDTO } from "../../dtos/user/GetUserProfile.dto";

export interface IGetCurrentUserProfile {
  exec(id: string): Promise<GetCurrentUserProfileDTO | null>;
}
