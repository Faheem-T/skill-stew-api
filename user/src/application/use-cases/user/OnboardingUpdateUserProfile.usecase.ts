import { EventName, EventPayload } from "@skillstew/common";
import {
  OnboardingUpdateUserProfileDTO,
  OnboardingUpdateUserProfileOutputDTO,
} from "../../dtos/user/OnboardingUpdateProfile.dto";
import { IOnboardingUpdateUserProfile } from "../../interfaces/user/IOnbaordingUpdateProfile";
import { ILocationProvider } from "../../ports/ILocationProvider";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { UserProfile } from "../../../domain/entities/UserProfile";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { v7 as uuidv7 } from "uuid";

export class OnboardingUpdateProfile implements IOnboardingUpdateUserProfile {
  constructor(
    private _userProfileRepo: IUserProfileRepository,
    private _locationProvider: ILocationProvider,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
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

    const savedProfile = await this._unitOfWork.transact(async (tx) => {
      const savedProfile = await this._userProfileRepo.updateByUserId(
        userId,
        profile,
        tx,
      );

      const eventName: EventName = "user.profileUpdated";
      const payload: EventPayload<typeof eventName> = {
        id: savedProfile.userId,
        name: savedProfile.name,
        languages: savedProfile.languages,
        location: savedProfile.location,
        avatarKey: savedProfile.avatarKey,
      };

      await this._outboxRepo.create(
        {
          id: uuidv7(),
          name: eventName,
          payload,
          status: "PENDING",
          createdAt: new Date(),
          processedAt: undefined,
        },
        tx,
      );

      return savedProfile;
    });

    return {
      name: savedProfile.name,
      languages: savedProfile.languages,
      avatarUrl: savedProfile.avatarKey,
      location: savedProfile.location,
    };
  };
}
