import { RegisterExpertDTO } from "../../dtos/auth/RegisterExpert.dto";

export interface IRegisterExpert {
  exec(dto: RegisterExpertDTO): Promise<void>;
}
