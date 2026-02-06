import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import {
  GetUsersDTO,
  AdminSearchUsersOutputDTO,
} from "../../dtos/admin/GetUsers.dto";
import { IGetUsers } from "../../interfaces/admin/IGetUsers";

export class GetUsers implements IGetUsers {
  constructor(private _userRepo: IUserRepository) {}
  exec = async (dto: GetUsersDTO): Promise<AdminSearchUsersOutputDTO> => {
    const { users, hasNextPage, nextCursor } =
      await this._userRepo.findAll(dto);
    return {
      users,
      hasNextPage,
      nextCursor,
    };
  };
}
