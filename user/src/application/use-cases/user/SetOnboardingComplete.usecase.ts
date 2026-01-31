import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { ISetOnboardingComplete } from "../../interfaces/user/ISetOnboardingComplete.usecase";

export class SetOnboardingComplete implements ISetOnboardingComplete {
  constructor(private _userProfileRepo: IUserProfileRepository) {}

  exec = async (userId: string): Promise<void> => {
    await this._userProfileRepo.updateByUserId(userId, {
      isOnboardingComplete: true,
    });
  };
}
