import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import {
  GetUserAvatarDTO,
  GetUserAvatarOutputDTO,
} from "../../dtos/user/GetUserAvatar.dto";
import { IGetUserAvatar } from "../../interfaces/user/IGetUserAvatar";
import { IStorageService } from "../../ports/IStorageService";

export class GetUserAvatar implements IGetUserAvatar {
  constructor(
    private _userProfileRepo: IUserProfileRepository,
    private _storageService: IStorageService,
  ) {}
  exec = async (dto: GetUserAvatarDTO): Promise<GetUserAvatarOutputDTO> => {
    const profile = await this._userProfileRepo.findByUserId(dto.userId);
    const avatarUrl = profile.avatarKey
      ? this._storageService.getPublicUrl(profile.avatarKey)
      : null;

    return { avatarUrl };
  };
}
