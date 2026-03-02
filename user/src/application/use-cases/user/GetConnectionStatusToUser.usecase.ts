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
      return { connectionId: connection.id, status: connection.status };
    } catch (err) {
      if (!(err instanceof NotFoundError)) {
        throw err;
      }
    }

    // if not found
    // find user -> target
    const connection = await this._connectionRepo.findByRequesterAndRecipientId(
      userId,
      targetId,
    );

    switch (connection.status) {
      case "PENDING":
        return {
          connectionId: connection.id,
          status: "CURRENT_USER_REQUESTING",
        };
      case "ACCEPTED":
        return { connectionId: connection.id, status: "ACCEPTED" };
      case "REJECTED":
        return {
          connectionId: connection.id,
          status: "REJECTED_BY_TARGET_USER",
        };
    }
  };
}
