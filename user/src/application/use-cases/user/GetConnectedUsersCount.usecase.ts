import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import {
  GetConnectedUsersCountDTO,
  GetConnectedUsersCountOutputDTO,
} from "../../dtos/user/GetConnectedUsersCount.dto";
import { IGetConnectedUsersCount } from "../../interfaces/user/IGetConnectedUsersCount";

export class GetConnectedUsersCount implements IGetConnectedUsersCount {
  constructor(private _connectionRepo: IUserConnectionRepository) {}

  exec = async (
    dto: GetConnectedUsersCountDTO,
  ): Promise<GetConnectedUsersCountOutputDTO> => {
    const count = await this._connectionRepo.countAcceptedConnectionsForUser(
      dto.userId,
    );

    return { count };
  };
}
