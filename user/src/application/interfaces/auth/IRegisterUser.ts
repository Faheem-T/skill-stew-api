import { RegisterDTO, RegisterOutputDTO } from "../../dtos/auth/Register.dto";

export interface IRegisterUser {
  exec(dto: RegisterDTO): Promise<RegisterOutputDTO>;
}
