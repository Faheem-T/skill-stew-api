import { IUserConnectionRepository } from "../../../domain/repositories/IUserConnectionRepository";
import {
  GetConnectionStatusesDTO,
  GetConnectionStatusesOutputDTO,
} from "../../dtos/user/GetConnectionStatus.dto";
import { IGetConnectionStatuses } from "../../interfaces/user/IGetConnectionStatuses";

export class GetConnectionStatuses implements IGetConnectionStatuses {
  constructor(private _connectionRepo: IUserConnectionRepository) {}

  exec = async (
    dto: GetConnectionStatusesDTO,
  ): Promise<GetConnectionStatusesOutputDTO> => {
    const { targetIds, userId } = dto;

    const results = await this._connectionRepo.getConnectionStatus(
      userId,
      targetIds,
    );

    const outputDto: GetConnectionStatusesOutputDTO = {};

    results.forEach(({ recipientId, status }) => {
      outputDto[recipientId] = status;
    });

    return outputDto;
  };
}
