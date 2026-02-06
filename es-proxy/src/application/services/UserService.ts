import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { GetRecommendedUsersOutputDTO } from "../dtos/GetRecommendedUsersDTO";
import {
  SaveUserDTO,
  UpdateUserProfileDTO,
  UpdateUserSkillProfileDTO,
} from "../dtos/UserDTO";
import { IUserService } from "../interfaces/IUserService";
import { IStorageService } from "../ports/IStorageService";

export class UserService implements IUserService {
  constructor(
    private _userRepo: IUserRepository,
    private _storageService: IStorageService,
  ) {}

  create = async (dto: SaveUserDTO): Promise<void> => {
    const user = new User(dto.id);
    await this._userRepo.create(user.id, user);
  };

  verifyUser = async (id: string): Promise<void> => {
    const user = new User(id);
    user.isVerified = true;
    await this._userRepo.update(id, user);
  };

  updateUserProfile = async (dto: UpdateUserProfileDTO): Promise<void> => {
    const { id, languages, location, name, username, avatarKey } = dto;

    const user = new User(id);
    user.name = name;
    user.username = username;
    user.location = location;
    user.languages = languages;
    user.avatarKey = avatarKey;

    await this._userRepo.update(id, user);
  };

  updateUserSkillProfile = async (
    dto: UpdateUserSkillProfileDTO,
  ): Promise<void> => {
    const { id, offeredSkills, wantedSkills } = dto;
    const user = new User(id);
    user.offeredSkills = offeredSkills;
    user.wantedSkills = wantedSkills;
    await this._userRepo.update(id, user);
  };

  getRecommendedUsers = async (
    userId: string,
  ): Promise<GetRecommendedUsersOutputDTO> => {
    const user = await this._userRepo.findById(userId);

    const location = user.location
      ? { lat: user.location.latitude, lon: user.location.longitude }
      : undefined;

    const recommendedUsers = await this._userRepo.findRecommendedUsers({
      languages: user.languages,
      location,
      offeredSkills: user.wantedSkills?.map((skill) => skill.skillId),
      wantedSkills: user.offeredSkills?.map((skill) => skill.skillId),
    });

    const filteredUsers = recommendedUsers.filter(
      (recommendedUser) => recommendedUser.id !== userId,
    );

    return filteredUsers.map(
      ({
        id,
        name,
        username,
        isVerified,
        languages,
        avatarKey,
        location,
        offeredSkills,
        wantedSkills,
      }) => ({
        id,
        name,
        username,
        languages,
        wantedSkills,
        offeredSkills,
        location: location?.formattedAddress,

        ...(avatarKey
          ? { avatarUrl: this._storageService.getPublicUrl(avatarKey) }
          : {}),
      }),
    );
  };
}
