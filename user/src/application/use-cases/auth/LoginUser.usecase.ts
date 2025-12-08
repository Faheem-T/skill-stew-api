import { UserBlockedError } from "../../../domain/errors/UserBlockedError";
import { WrongPasswordError } from "../../../domain/errors/WrongPasswordError";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { LoginDTO } from "../../dtos/auth/Login.dto";
import { GoogleAuthError } from "../../errors/GoogleAuthErrors";
import { ILoginUser } from "../../interfaces/auth/ILoginUser";
import { IHasherService } from "../../ports/IHasherService";
import { IJwtService } from "../../ports/IJwtService";

export class LoginUser implements ILoginUser {
  constructor(
    private _userRepo: IUserRepository,
    private _jwtService: IJwtService,
    private _hasherService: IHasherService,
  ) {}
  exec = async ({
    email,
    password,
  }: LoginDTO): Promise<{
    refreshToken: string;
    accessToken: string;
  } | null> => {
    const user = await this._userRepo.findByEmail(email);
    if (!user) {
      return null;
    }
    if (user.isGoogleLogin) {
      throw new GoogleAuthError("GOOGLE_ACCOUNT_EXISTS");
    }
    if (!this._hasherService.compare(password, user.passwordHash!)) {
      throw new WrongPasswordError();
    }
    if (user.isBlocked) {
      throw new UserBlockedError();
    }

    const role = user.role;
    const userId = user.id as string;

    const refreshToken = this._jwtService.generateRefreshToken(
      {
        email,
        role: role,
        userId: userId,
      },
      role,
    );
    const accessToken = this._jwtService.generateAccessToken(
      {
        email,
        role: role,
        userId: userId,
      },
      role,
    );
    return { refreshToken, accessToken };
  };
}
