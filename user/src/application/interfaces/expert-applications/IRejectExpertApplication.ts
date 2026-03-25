import { RejectExpertApplicationDTO } from "../../dtos/expert/RejectExpertApplication.dto";

export interface IRejectExpertApplication {
  exec(dto: RejectExpertApplicationDTO): Promise<boolean>;
}
