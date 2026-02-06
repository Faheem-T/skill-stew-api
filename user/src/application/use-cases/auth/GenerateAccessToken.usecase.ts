import { IGenerateAccessToken } from "../../interfaces/auth/IGenerateAccessToken";
import { IJwtService } from "../../ports/IJwtService";

export class GenerateAccessToken implements IGenerateAccessToken {
  constructor(private _jwtService: IJwtService) {}
  exec = async (refreshToken: string): Promise<string> => {
    const decoded = this._jwtService.verifyRefreshToken(refreshToken);
    const role = decoded.role;
    const userId = decoded.userId;
    const payload = {
      userId,
      role,
      email: decoded.email,
    };
    return this._jwtService.generateAccessToken(payload, decoded.role);
  };
}
