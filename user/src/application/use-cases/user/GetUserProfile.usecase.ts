import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IGetUserProfile } from "../../interfaces/user/IGetUserProfile";

export class GetUserProfile implements IGetUserProfile {
  constructor(private readonly _userRepo: IUserRepository) {}
  exec = async (
    id: string,
  ): Promise<{
    name?: string;
    username?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    timezone?: string;
    location?: { latitude: number; longitude: number };
    about?: string;
    socialLinks: string[];
    languages: string[];
  } | null> => {
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
