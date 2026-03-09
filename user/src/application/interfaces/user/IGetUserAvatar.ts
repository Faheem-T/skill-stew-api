import {
  GetUserAvatarDTO,
  GetUserAvatarOutputDTO,
} from "../../dtos/user/GetUserAvatar.dto";

export interface IGetUserAvatar {
  exec(dto: GetUserAvatarDTO): Promise<GetUserAvatarOutputDTO>;
}
