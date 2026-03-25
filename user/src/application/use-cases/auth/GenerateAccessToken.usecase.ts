import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { InvalidAuthTokenError } from "../../errors/infra/InvalidAuthTokenError";
import { IGenerateAccessToken } from "../../interfaces/auth/IGenerateAccessToken";
import { IJwtService } from "../../ports/IJwtService";

export class GenerateAccessToken implements IGenerateAccessToken {
  constructor(
    private _jwtService: IJwtService,
    private _userRepo: IUserRepository,
  ) {}
  exec = async (refreshToken: string): Promise<string> => {
    const decoded = this._jwtService.verifyRefreshToken(refreshToken);
    const role = decoded.role;
    const userId = decoded.userId;

    if (role == "EXPERT_APPLICANT") {
      const user = await this._userRepo.findById(userId);
      if (user.role !== role) {
        throw new InvalidAuthTokenError();
      }
    }

    const payload = {
      userId,
      role,
      email: decoded.email,
    };
    return this._jwtService.generateAccessToken(payload, decoded.role);
  };
}
