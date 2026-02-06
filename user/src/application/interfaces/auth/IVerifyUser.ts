import { VerifyUserDTO } from "../../dtos/auth/VerifyUser.dto";

export interface IVerifyUser {
  exec(dto: VerifyUserDTO): Promise<void>;
}
