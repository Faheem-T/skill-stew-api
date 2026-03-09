import { GetAllConnectedUserIdsOutputDTO } from "../../dtos/user/GetAllConnectedUserIds.dto";

export interface IGetAllConnectedUserIds {
  exec(userId: string): Promise<GetAllConnectedUserIdsOutputDTO>;
}
