import {
  OnboardingUpdateUserProfileDTO,
  OnboardingUpdateUserProfileOutputDTO,
} from "../../dtos/user/OnboardingUpdateProfile.dto";

export interface IOnboardingUpdateUserProfile {
  exec(
    dto: OnboardingUpdateUserProfileDTO,
  ): Promise<OnboardingUpdateUserProfileOutputDTO | null>;
}
