import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IExpertApplicationRepository } from "../../../domain/repositories/IExpertApplicationRepository";
import {
  GetExpertApplicationDetailsDTO,
  GetExpertApplicationDetailsOutputDTO,
} from "../../dtos/expert/GetExpertApplicationDetails.dto";
import { IGetExpertApplicationDetails } from "../../interfaces/expert/IGetExpertApplicationDetails";

export class GetExpertApplicationDetails
  implements IGetExpertApplicationDetails
{
  constructor(
    private _expertApplicationRepo: IExpertApplicationRepository,
    private _userRepo: IUserRepository,
  ) {}

  exec = async (
    dto: GetExpertApplicationDetailsDTO,
  ): Promise<GetExpertApplicationDetailsOutputDTO> => {
    const application = await this._expertApplicationRepo.findById(
      dto.applicationId,
    );
    const user = await this._userRepo.findById(application.expertId);

    return {
      ...application,
      email: user.email,
    };
  };
}
