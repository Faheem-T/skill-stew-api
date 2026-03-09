import { UserConnectionStatus } from "../../../domain/entities/UserConnectionStatus";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import {
  GetUserProfileDTO,
  GetUserProfileOutputDTO,
} from "../../dtos/user/GetUserProfile.dto";
import { IGetUserProfile } from "../../interfaces/user/IGetUserProfile";
import { IStorageService } from "../../ports/IStorageService";

export class GetUserProfile implements IGetUserProfile {
  constructor(
    private _userRepo: IUserRepository,
    private _userProfileRepo: IUserProfileRepository,
    private _connectionRepo: IUserConnectionRepository,
    private _storageService: IStorageService,
  ) {}

  exec = async (dto: GetUserProfileDTO): Promise<GetUserProfileOutputDTO> => {
    const { userId } = dto;

    const { id, username, isVerified } = await this._userRepo.findById(userId);

    const {
      name,
      about,
      avatarKey,
      bannerKey,
      languages,
      location,
      socialLinks,
      timezone,
    } = await this._userProfileRepo.findByUserId(userId);

    const avatarUrl = avatarKey
      ? this._storageService.getPublicUrl(avatarKey)
      : undefined;

    const bannerUrl = bannerKey
      ? this._storageService.getPublicUrl(bannerKey)
      : undefined;

    const output: GetUserProfileOutputDTO = {
      userId: id,
      username,
      isVerified,
      name,
      about,
      languages,
      location: location?.formattedAddress,
      socialLinks,
      timezone,
      avatarUrl,
      bannerUrl,
    };

    return output;
  };
}
