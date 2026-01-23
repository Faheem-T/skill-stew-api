import { CreateEvent } from "@skillstew/common";
import {
  IUserLocation,
  UserProfile,
} from "../../../domain/entities/UserProfile";
import {
  UpdateProfileDTO,
  UpdateProfileOutputDTO,
} from "../../dtos/user/UpdateUserProfile.dto";
import { IUpdateUserProfile } from "../../interfaces/user/IUpdateUserProfile";
import { IProducer } from "../../ports/IProducer";
import { ILocationProvider } from "../../ports/ILocationProvider";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { IStorageService } from "../../ports/IStorageService";

export class UpdateUserProfile implements IUpdateUserProfile {
  constructor(
    private _messageProducer: IProducer,
    private _userProfileRepo: IUserProfileRepository,
    private _locationProvider: ILocationProvider,
    private _storageService: IStorageService,
  ) {}

  exec = async (dto: UpdateProfileDTO): Promise<UpdateProfileOutputDTO> => {
    const {
      userId,
      name,
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

    const profile: Partial<UserProfile> = {
      userId,
      name,
      about,
      avatarKey,
      location: locationDetails,
      languages,
      phoneNumber,
      socialLinks,
      timezone,
    };
    const savedUser = await this._userProfileRepo.updateByUserId(
      userId,
      profile,
    );

    // emit event
    const event = CreateEvent(
      "user.profileUpdated",
      {
        id: savedUser.userId,
        name: savedUser.name,
        languages: savedUser.languages,
        location: savedUser.location,
        avatarKey: savedUser.avatarKey,
      },
      "user-service",
    );
    this._messageProducer.publish(event);

    const avatarUrl = savedUser.avatarKey
      ? this._storageService.getPublicUrl(savedUser.avatarKey)
      : undefined;
    const bannerUrl = savedUser.bannerKey
      ? this._storageService.getPublicUrl(savedUser.bannerKey)
      : undefined;

    return {
      name: savedUser.name,
      languages: savedUser.languages,
      avatarUrl,
      bannerUrl,
      location: savedUser.location,
      phoneNumber: savedUser.phoneNumber,
      socialLinks: savedUser.socialLinks,
      timezone: savedUser.timezone,
      about: savedUser.about,
    };
  };
}
