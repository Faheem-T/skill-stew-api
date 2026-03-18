import {
  SubmitExpertApplicationDTO,
  SubmitExpertApplicationOutputDTO,
} from "../../dtos/expert/SubmitExpertApplication.dto";

export interface ISubmitExpertApplication {
  exec(
    dto: SubmitExpertApplicationDTO,
  ): Promise<SubmitExpertApplicationOutputDTO>;
}
