import {
  GetConnectedUsersDTO,
  GetConnectedUsersOutputDTO,
} from "../../dtos/user/GetConnectedUsers.dto";

export interface IGetConnectedUsers {
  exec(dto: GetConnectedUsersDTO): Promise<GetConnectedUsersOutputDTO>;
}
