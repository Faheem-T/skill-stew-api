import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import {
  GetConnectedUsersDTO,
  GetConnectedUsersOutputDTO,
} from "../../dtos/user/GetConnectedUsers.dto";
import { IGetConnectedUsers } from "../../interfaces/user/IGetConnectedUsers";
import { IStorageService } from "../../ports/IStorageService";

export class GetConnectedUsers implements IGetConnectedUsers {
  constructor(
    private _connectionRepo: IUserConnectionRepository,
    private _storageService: IStorageService,
  ) {}

  exec = async (
    dto: GetConnectedUsersDTO,
  ): Promise<GetConnectedUsersOutputDTO> => {
    const { rows, hasNextPage, nextCursor } =
      await this._connectionRepo.getAcceptedConnectionsForUserPaginated(dto);

    return {
      users: rows.map((row) => ({
        id: row.connectedUserId,
        username: row.username,
        avatarUrl: row.avatarKey
          ? this._storageService.getPublicUrl(row.avatarKey)
          : null,
        connectedAt: row.connectedAt,
      })),
      hasNextPage,
      nextCursor,
    };
  };
}
