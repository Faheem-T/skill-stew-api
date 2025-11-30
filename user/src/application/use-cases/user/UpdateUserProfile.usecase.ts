import { CreateEvent } from "@skillstew/common";
import { IUserLocation, User } from "../../../domain/entities/User";
import { PresentationUser } from "../../dtos/GetAllUsersDTO";
import { UpdateProfileDTO } from "../../dtos/user/UpdateUserProfile.dto";
import { IUpdateUserProfile } from "../../interfaces/user/IUpdateUserProfile";
import { IProducer } from "../../ports/IProducer";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UserDTOMapper } from "../../mappers/UserDTOMapper";
import { ILocationProvider } from "../../ports/ILocationProvider";

export class UpdateUserProfile implements IUpdateUserProfile {
  constructor(
    private _messageProducer: IProducer,
    private _userRepo: IUserRepository,
    private _locationProvider: ILocationProvider,
  ) {}

  exec = async (dto: UpdateProfileDTO): Promise<PresentationUser | null> => {
    const {
      id,
      name,
      username,
      about,
      avatarKey,
      location,
      languages,
      phoneNumber,
      socialLinks,
      timezone,
    } = dto;

    let locationDetails: IUserLocation | undefined = undefined;
    if (location) {
      const details = await this._locationProvider.getPlaceById(
        location.placeId,
      );
      if (details) {
        locationDetails = details;
      }
    }

    const user: Partial<User> = {
      id,
      name,
      username,
      about,
      avatarKey,
      location: locationDetails,
      languages,
      phoneNumber,
      socialLinks,
      timezone,
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
