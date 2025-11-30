import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { GetCurrentUserProfileDTO } from "../../dtos/user/GetUserProfile.dto";
import { IGetCurrentUserProfile } from "../../interfaces/user/IGetCurrentUserProfile";

export class GetUserProfile implements IGetCurrentUserProfile {
  constructor(private readonly _userRepo: IUserRepository) {}
  exec = async (id: string): Promise<GetCurrentUserProfileDTO | null> => {
    const user = await this._userRepo.findById(id);
    if (!user) return null;

    // TODO
    // convert avatarKey and bannerKey to url

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
    } = user;
    return {
      name,
      username,
      phoneNumber,
      avatarUrl: avatarKey,
      bannerUrl: bannerKey,
      timezone,
      location,
      about,
      socialLinks,
      languages,
    };
  };
}
