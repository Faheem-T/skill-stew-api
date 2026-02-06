import { UpdateUsernameDTO } from "../../dtos/common/UpdateUsername.dto";

export interface IUpdateUsername {
  exec(dto: UpdateUsernameDTO): Promise<void>;
}
