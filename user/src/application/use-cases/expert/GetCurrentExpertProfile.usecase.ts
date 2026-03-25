import { IExpertProfileRepository } from "../../../domain/repositories/IExpertProfileRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { GetCurrentExpertProfileOutputDTO } from "../../dtos/expert/GetCurrentExpertProfile.dto";
import { IGetCurrentExpertProfile } from "../../interfaces/expert/IGetCurrentExpertProfile";
import { IStorageService } from "../../ports/IStorageService";

export class GetCurrentExpertProfileUsecase implements IGetCurrentExpertProfile {
  constructor(
    private _userRepo: IUserRepository,
    private _expertProfileRepo: IExpertProfileRepository,
    private _storageService: IStorageService,
  ) {}

  exec = async (
    expertId: string,
  ): Promise<GetCurrentExpertProfileOutputDTO> => {
    const expert = await this._userRepo.findById(expertId);
    const profile = await this._expertProfileRepo.findByExpertId(expertId);

    const {
      bio,
      fullName,
      joinedAt,
      languages,
      phone,
      socialLinks,
      avatarKey,
      bannerKey,
    } = profile;

    const avatarUrl = avatarKey
      ? this._storageService.getPublicUrl(avatarKey)
      : undefined;

    const bannerUrl = bannerKey
      ? this._storageService.getPublicUrl(bannerKey)
      : undefined;

    return {
      id: expert.id,
      email: expert.email,
      role: "EXPERT",
      bio,
      socialLinks,
      fullName,
      joinedAt,
      languages,
      phone,
      avatarUrl,
      bannerUrl,
    };
  };
}
