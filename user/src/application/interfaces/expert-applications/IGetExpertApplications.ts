import {
  GetExpertApplicationsDTO,
  GetExpertApplicationsOutputDTO,
} from "../../dtos/expert/GetExpertApplications.dto";

export interface IGetExpertApplications {
  exec(dto: GetExpertApplicationsDTO): Promise<GetExpertApplicationsOutputDTO>;
}
