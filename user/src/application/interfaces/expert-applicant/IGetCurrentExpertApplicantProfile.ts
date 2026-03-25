import { GetCurrentExpertApplicantProfileOutputDTO } from "../../dtos/expert-applicant/GetCurrentExpertApplicantProfile.dto";

export interface IGetCurrentExpertApplicantProfile {
  exec(id: string): Promise<GetCurrentExpertApplicantProfileOutputDTO>;
}
