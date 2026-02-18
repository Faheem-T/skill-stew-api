import { EventName, EventPayload } from "@skillstew/common";
import {
  IUserLocation,
  UserProfile,
} from "../../../domain/entities/UserProfile";
import {
  UpdateProfileDTO,
  UpdateProfileOutputDTO,
} from "../../dtos/user/UpdateUserProfile.dto";
import { IUpdateUserProfile } from "../../interfaces/user/IUpdateUserProfile";
import { ILocationProvider } from "../../ports/ILocationProvider";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { IStorageService } from "../../ports/IStorageService";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { v7 as uuidv7 } from "uuid";

export class UpdateUserProfile implements IUpdateUserProfile {
  constructor(
    private _userProfileRepo: IUserProfileRepository,
    private _locationProvider: ILocationProvider,
    private _storageService: IStorageService,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
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
      bannerKey,
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
      bannerKey,
    };
    const savedUser = await this._unitOfWork.transact(async (tx) => {
      const savedUser = await this._userProfileRepo.updateByUserId(
        userId,
        profile,
        tx,
      );

      const eventName: EventName = "user.profileUpdated";
      const payload: EventPayload<typeof eventName> = {
        id: savedUser.userId,
        name: savedUser.name,
        languages: savedUser.languages,
        location: savedUser.location,
        avatarKey: savedUser.avatarKey,
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

      return savedUser;
    });

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
