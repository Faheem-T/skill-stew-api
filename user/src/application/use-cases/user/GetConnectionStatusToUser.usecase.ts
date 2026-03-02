import { UserConnectionStatus } from "../../../domain/entities/UserConnectionStatus";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import {
  GetConnectionStatusToUserDTO,
  GetConnectionStatusToUserOutputDTO,
} from "../../dtos/user/GetConnectionStatusToUser.dto";
import { IGetConnectionStatusToUser } from "../../interfaces/user/IGetConnectionStatusToUser";

export class GetConnectionStatusToUser implements IGetConnectionStatusToUser {
  constructor(private _connectionRepo: IUserConnectionRepository) {}

  exec = async (
    dto: GetConnectionStatusToUserDTO,
  ): Promise<GetConnectionStatusToUserOutputDTO> => {
    const { userId, targetId } = dto;
    // first find target -> user connection
    try {
      const connection =
        await this._connectionRepo.findByRequesterAndRecipientId(
          targetId,
          userId,
        );
      return connection.status;
    } catch (err) {
      if (!(err instanceof NotFoundError)) {
        throw err;
      }
    }

    // if not found
    // find user -> target
    try {
      const connection =
        await this._connectionRepo.findByRequesterAndRecipientId(
          userId,
          targetId,
        );

      switch (connection.status) {
        case "PENDING":
          return "CURRENT_USER_REQUESTING";
        case "ACCEPTED":
          return "ACCEPTED";
        case "REJECTED":
          return "REJECTED_BY_TARGET_USER";
      }
    } catch (err) {
      if (err instanceof NotFoundError) {
        return "NONE";
      } else {
        throw err;
      }
    }
  };
}
