import { IGetCurrentExpertProfile } from "../../interfaces/expert/IGetCurrentExpertProfile";

export class GetCurrentExpertProfileUsecase implements IGetCurrentExpertProfile {
  exec = async (expertId: string): Promise<any> => {
    return "TODO";
  };
}
