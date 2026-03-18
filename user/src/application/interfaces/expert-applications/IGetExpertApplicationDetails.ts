import {
  GetExpertApplicationDetailsDTO,
  GetExpertApplicationDetailsOutputDTO,
} from "../../dtos/expert/GetExpertApplicationDetails.dto";

export interface IGetExpertApplicationDetails {
  exec(
    dto: GetExpertApplicationDetailsDTO,
  ): Promise<GetExpertApplicationDetailsOutputDTO>;
}
