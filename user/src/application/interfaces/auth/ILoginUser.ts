import { LoginDTO } from "../../dtos/auth/Login.dto";

export interface ILoginUser {
  exec(
    dto: LoginDTO,
  ): Promise<{ refreshToken: string; accessToken: string } | null>;
}
