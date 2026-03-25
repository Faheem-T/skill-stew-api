import { GoogleAuthDTO } from "../../dtos/auth/GoogleAuth.dto";

export interface IGoogleAuth {
  exec(dto: GoogleAuthDTO): Promise<{
    refreshToken: string;
    accessToken: string;
  }>;
}
