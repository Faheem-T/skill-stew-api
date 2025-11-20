import { PresentationUser } from "../../dtos/GetAllUsersDTO";
import { OnboardingUpdateUserProfileDTO } from "../../dtos/user/OnboardingUpdateProfile.dto";

export interface IOnboardingUpdateUserProfile {
  exec(dto: OnboardingUpdateUserProfileDTO): Promise<PresentationUser | null>;
}
