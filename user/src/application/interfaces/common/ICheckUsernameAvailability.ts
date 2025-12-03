import { CheckUsernameAvailabilityDTO } from "../../dtos/common/CheckUsernameAvailability.dto";

export interface ICheckUsernameAvailability {
  exec(dto: CheckUsernameAvailabilityDTO): Promise<{ available: boolean }>;
}
