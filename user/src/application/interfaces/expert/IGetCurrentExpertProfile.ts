import { GetCurrentExpertProfileOutputDTO } from "../../dtos/expert/GetCurrentExpertProfile.dto";

export interface IGetCurrentExpertProfile {
  exec(expertId: string): Promise<GetCurrentExpertProfileOutputDTO>;
}
