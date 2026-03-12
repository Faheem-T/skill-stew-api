import { IExpertApplicationRepository } from "../../../domain/repositories/IExpertApplicationRepository";
import {
  GetExpertApplicationDetailsDTO,
  GetExpertApplicationDetailsOutputDTO,
} from "../../dtos/expert/GetExpertApplicationDetails.dto";
import { IGetExpertApplicationDetails } from "../../interfaces/expert/IGetExpertApplicationDetails";

export class GetExpertApplicationDetails
  implements IGetExpertApplicationDetails
{
  constructor(private _expertApplicationRepo: IExpertApplicationRepository) {}

  exec = async (
    dto: GetExpertApplicationDetailsDTO,
  ): Promise<GetExpertApplicationDetailsOutputDTO> => {
    return await this._expertApplicationRepo.findById(dto.applicationId);
  };
}
