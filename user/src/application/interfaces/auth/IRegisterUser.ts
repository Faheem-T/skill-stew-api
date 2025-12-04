import { RegisterOutputDTO } from "../../dtos/RegisterDTO";

export interface IRegisterUser {
  exec(email: string, password: string): Promise<RegisterOutputDTO>;
}
