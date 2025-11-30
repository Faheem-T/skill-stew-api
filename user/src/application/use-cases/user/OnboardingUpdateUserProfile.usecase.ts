import { CreateEvent } from "@skillstew/common";
import { User } from "../../../domain/entities/User";
import { PresentationUser } from "../../dtos/GetAllUsersDTO";
import { IProducer } from "../../ports/IProducer";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UserDTOMapper } from "../../mappers/UserDTOMapper";
import { OnboardingUpdateUserProfileDTO } from "../../dtos/user/OnboardingUpdateProfile.dto";
import { IOnboardingUpdateUserProfile } from "../../interfaces/user/IOnbaordingUpdateProfile";
import { ILocationProvider } from "../../ports/ILocationProvider";

export class OnboardingUpdateProfile implements IOnboardingUpdateUserProfile {
  constructor(
    private _messageProducer: IProducer,
    private _userRepo: IUserRepository,
    private _locationProvider: ILocationProvider,
  ) {}

  exec = async (
    dto: OnboardingUpdateUserProfileDTO,
  ): Promise<PresentationUser | null> => {
    const { id, name, username, avatarKey, location, languages } = dto;

    const locationDetails = location?.placeId
      ? await this._locationProvider.getPlaceById(location.placeId)
      : undefined;

    const user: Partial<User> = {
      id,
      name,
      username,
      avatarKey,
      location: locationDetails ?? undefined,
      languages,
    };

    const savedUser = await this._userRepo.update(id, user);

    if (!savedUser) return null;

    const event = CreateEvent(
      "user.profileUpdated",
      {
        id: savedUser.id,
        name: savedUser.name,
        username: savedUser.username,
        languages: savedUser.languages,
        location: savedUser.location,
      },
      "user-service",
    );
    this._messageProducer.publish(event);
    return UserDTOMapper.toPresentation(savedUser);
  };
}
