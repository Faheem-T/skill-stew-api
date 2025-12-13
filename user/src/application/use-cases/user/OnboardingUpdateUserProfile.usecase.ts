import { CreateEvent } from "@skillstew/common";
import { IProducer } from "../../ports/IProducer";
import {
  OnboardingUpdateUserProfileDTO,
  OnboardingUpdateUserProfileOutputDTO,
} from "../../dtos/user/OnboardingUpdateProfile.dto";
import { IOnboardingUpdateUserProfile } from "../../interfaces/user/IOnbaordingUpdateProfile";
import { ILocationProvider } from "../../ports/ILocationProvider";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { UserProfile } from "../../../domain/entities/UserProfile";

export class OnboardingUpdateProfile implements IOnboardingUpdateUserProfile {
  constructor(
    private _messageProducer: IProducer,
    private _userProfileRepo: IUserProfileRepository,
    private _locationProvider: ILocationProvider,
  ) {}

  exec = async (
    dto: OnboardingUpdateUserProfileDTO,
  ): Promise<OnboardingUpdateUserProfileOutputDTO> => {
    const { userId, name, avatarKey, location, languages } = dto;

    const locationDetails = location?.placeId
      ? await this._locationProvider.getPlaceById(location.placeId)
      : undefined;

    const profile: Partial<UserProfile> = {
      userId,
      name,
      avatarKey,
      location: locationDetails ?? undefined,
      languages,
    };

    const savedProfile = await this._userProfileRepo.updateByUserId(
      userId,
      profile,
    );

    const event = CreateEvent(
      "user.profileUpdated",
      {
        id: savedProfile.userId,
        name: savedProfile.name,
        languages: savedProfile.languages,
        location: savedProfile.location,
      },
      "user-service",
    );
    this._messageProducer.publish(event);
    return {
      name: savedProfile.name,
      languages: savedProfile.languages,
      avatarUrl: savedProfile.avatarKey,
      location: savedProfile.location,
    };
  };
}
