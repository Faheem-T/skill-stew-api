import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { GetCurrentUserProfileDTO } from "../../dtos/user/GetCurrentUserProfile.dto";
import { IGetCurrentUserProfile } from "../../interfaces/user/IGetCurrentUserProfile";
import { IStorageService } from "../../ports/IStorageService";

export class GetCurrentUserProfile implements IGetCurrentUserProfile {
  constructor(
    private readonly _userRepo: IUserRepository,
    private readonly _storageService: IStorageService,
  ) {}
  exec = async (id: string): Promise<GetCurrentUserProfileDTO | null> => {
    const user = await this._userRepo.findById(id);
    if (!user) return null;
    const {
      name,
      username,
      phoneNumber,
      avatarKey,
      bannerKey,
      timezone,
      location,
      about,
      socialLinks,
      languages,
      email,
      role,
    } = user;

    const avatarUrl = avatarKey
      ? this._storageService.getPublicUrl(avatarKey)
      : undefined;
    const bannerUrl = bannerKey
      ? this._storageService.getPublicUrl(bannerKey)
      : undefined;

    return {
      name,
      email,
      role,
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
