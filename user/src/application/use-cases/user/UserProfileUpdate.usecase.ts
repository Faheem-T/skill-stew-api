import { CreateEvent } from "@skillstew/common";
import { User } from "../../../domain/entities/User";
import { PresentationUser } from "../../dtos/GetAllUsersDTO";
import { UpdateProfileDTO } from "../../dtos/user/UpdateProfileDTO";
import { IUserProfileUpdate } from "../../interfaces/user/IUserProfileUpdate";
import { IProducer } from "../../ports/IProducer";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UserDTOMapper } from "../../mappers/UserDTOMapper";

export class UserProfileUpdate implements IUserProfileUpdate {
  constructor(
    private _messageProducer: IProducer,
    private _userRepo: IUserRepository,
  ) {}

  exec = async (dto: UpdateProfileDTO): Promise<PresentationUser | null> => {
    const {
      id,
      name,
      username,
      about,
      avatarKey,
      location,
      languages,
      phoneNumber,
      socialLinks,
      timezone,
    } = dto;
    const user: Partial<User> = {
      id,
      name,
      username,
      about,
      avatarKey,
      location,
      languages,
      phoneNumber,
      socialLinks,
      timezone,
    };
    const savedUser = await this._userRepo.update(id, user);
    if (!savedUser) return null;
    const event = CreateEvent(
      "user.profileUpdated",
      {
        id: savedUser.id,
        name: savedUser.name,
        username: savedUser.username,
        languages: savedUser.languages,
        location: savedUser.location,
      },
      "user-service",
    );
    this._messageProducer.publish(event);
    return UserDTOMapper.toPresentation(savedUser);
  };
}
