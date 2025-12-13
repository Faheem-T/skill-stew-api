import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { GetCurrentUserProfileDTO } from "../../dtos/user/GetCurrentUserProfile.dto";
import { IGetCurrentUserProfile } from "../../interfaces/user/IGetCurrentUserProfile";
import { IStorageService } from "../../ports/IStorageService";

export class GetCurrentUserProfile implements IGetCurrentUserProfile {
  constructor(
    private readonly _userRepo: IUserRepository,
    private readonly _userProfileRepo: IUserProfileRepository,
    private readonly _storageService: IStorageService,
  ) {}
  exec = async (id: string): Promise<GetCurrentUserProfileDTO> => {
    const profile = await this._userProfileRepo.findByUserId(id);
    const user = await this._userRepo.findById(id);
    const {
      name,
      phoneNumber,
      avatarKey,
      bannerKey,
      timezone,
      location,
      about,
      socialLinks,
      languages,
    } = profile;

    const { email, role, username } = user;

    const avatarUrl = avatarKey
      ? this._storageService.getPublicUrl(avatarKey)
      : undefined;
    const bannerUrl = bannerKey
      ? this._storageService.getPublicUrl(bannerKey)
      : undefined;

    return {
      name,
      email,
      role: role as "USER",
      username,
      phoneNumber,
      avatarUrl,
      bannerUrl,
      timezone,
      location,
      about,
      socialLinks,
      languages,
    };
  };
}
