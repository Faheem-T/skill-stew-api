import {
  GetConnectionStatusesDTO,
  GetConnectionStatusesOutputDTO,
} from "../../dtos/user/GetConnectionStatus.dto";

export interface IGetConnectionStatuses {
  exec(dto: GetConnectionStatusesDTO): Promise<GetConnectionStatusesOutputDTO>;
}
