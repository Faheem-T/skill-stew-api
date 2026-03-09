import {
  GetConnectionStatusToUserDTO,
  GetConnectionStatusToUserOutputDTO,
} from "../../dtos/user/GetConnectionStatusToUser.dto";

export interface IGetConnectionStatusToUser {
  exec(
    dto: GetConnectionStatusToUserDTO,
  ): Promise<GetConnectionStatusToUserOutputDTO>;
}
