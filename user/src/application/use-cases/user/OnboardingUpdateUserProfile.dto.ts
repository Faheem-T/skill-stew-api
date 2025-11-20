import { CreateEvent } from "@skillstew/common";
import { User } from "../../../domain/entities/User";
import { PresentationUser } from "../../dtos/GetAllUsersDTO";
import { IProducer } from "../../ports/IProducer";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UserDTOMapper } from "../../mappers/UserDTOMapper";
import { OnboardingUpdateUserProfileDTO } from "../../dtos/user/OnboardingUpdateProfile.dto";
import { IOnboardingUpdateUserProfile } from "../../interfaces/user/IOnbaordingUpdateProfile";

export class OnboardingUpdateProfile implements IOnboardingUpdateUserProfile {
  constructor(
    private _messageProducer: IProducer,
    private _userRepo: IUserRepository,
  ) { }

  exec = async (dto: OnboardingUpdateUserProfileDTO): Promise<PresentationUser | null> => {
    const {
      id,
      name,
      username,
      avatarKey,
      location,
      languages,
    } = dto;
    const user: Partial<User> = {
      id,
      name,
      username,
      avatarKey,
      location,
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
