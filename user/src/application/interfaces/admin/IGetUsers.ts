import {
  AdminSearchUsersOutputDTO,
  GetUsersDTO,
} from "../../dtos/admin/GetUsers.dto";

export interface IGetUsers {
  exec(dto: GetUsersDTO): Promise<AdminSearchUsersOutputDTO>;
}
