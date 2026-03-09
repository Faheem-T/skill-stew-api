import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import { GetAllConnectedUserIdsOutputDTO } from "../../dtos/user/GetAllConnectedUserIds.dto";
import { IGetAllConnectedUserIds } from "../../interfaces/user/IGetAllConnectedUserIds";

export class GetAllConnectedUserIds implements IGetAllConnectedUserIds {
  constructor(private _connectionRepo: IUserConnectionRepository) {}

  exec = async (userId: string): Promise<GetAllConnectedUserIdsOutputDTO> => {
    const connections = await this._connectionRepo.findAllForUserId(userId);

    return connections.map(({ userId1, userId2, requesterId, status }) => {
      if (requesterId == userId) {
        const recipientId = requesterId == userId1 ? userId2 : userId1;
        return {
          userId: recipientId,
          status: status == "PENDING" ? "PENDING_SENT" : "CONNECTED",
        };
      } else {
        return {
          userId: requesterId,
          status: status == "PENDING" ? "PENDING_RECEIVED" : "CONNECTED",
        };
      }
    });
  };
}
