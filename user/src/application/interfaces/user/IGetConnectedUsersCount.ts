import {
  GetConnectedUsersCountDTO,
  GetConnectedUsersCountOutputDTO,
} from "../../dtos/user/GetConnectedUsersCount.dto";

export interface IGetConnectedUsersCount {
  exec(
    dto: GetConnectedUsersCountDTO,
  ): Promise<GetConnectedUsersCountOutputDTO>;
}
