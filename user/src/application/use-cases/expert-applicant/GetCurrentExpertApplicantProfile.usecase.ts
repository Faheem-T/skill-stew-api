import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { IExpertApplicationRepository } from "../../../domain/repositories/IExpertApplicationRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { GetCurrentExpertApplicantProfileOutputDTO } from "../../dtos/expert-applicant/GetCurrentExpertApplicantProfile.dto";
import { IGetCurrentExpertApplicantProfile } from "../../interfaces/expert-applicant/IGetCurrentExpertApplicantProfile";

export class GetCurrentExpertApplicantProfile implements IGetCurrentExpertApplicantProfile {
  constructor(
    private _userRepo: IUserRepository,
    private _expertApplicationRepo: IExpertApplicationRepository,
  ) {}

  exec = async (
    id: string,
  ): Promise<GetCurrentExpertApplicantProfileOutputDTO> => {
    const user = await this._userRepo.findById(id);
    let application;
    try {
      application = await this._expertApplicationRepo.findByExpertId(id);
    } catch (err) {
      if (!(err instanceof NotFoundError)) {
        throw err;
      }
    }

    let applicationStatus: GetCurrentExpertApplicantProfileOutputDTO["applicationStatus"];
    if (!application) {
      applicationStatus = "NOT_DONE";
    } else {
      applicationStatus =
        application.status == "rejected" ? "REJECTED" : "VERIFICATION_PENDING";
    }

    return {
      email: user.email,
      id,
      applicationStatus,
      role: "EXPERT_APPLICANT",
    };
  };
}
