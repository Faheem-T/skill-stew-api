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

    let userId1, userId2: string;

    if (userId.localeCompare(targetId) < 0) {
      userId1 = userId;
      userId2 = targetId;
    } else {
      userId2 = userId;
      userId1 = targetId;
    }

    try {
      const connection = await this._connectionRepo.findByUserIds(
        userId1,
        userId2,
      );

      let status: "CONNECTED" | "PENDING_SENT" | "PENDING_RECEIVED" | "NONE";

      if (connection.requesterId == userId) {
        switch (connection.status) {
          case "PENDING":
            status = "PENDING_SENT";
          case "ACCEPTED":
            status = "CONNECTED";
        }
      } else {
        switch (connection.status) {
          case "PENDING":
            status = "PENDING_RECEIVED";
          case "ACCEPTED":
            status = "CONNECTED";
        }
      }

      return { connectionId: connection.id, status };
    } catch (err) {
      if (err instanceof NotFoundError) {
        return { status: "NONE", connectionId: null };
      } else {
        throw err;
      }
    }
  };
}
