import { User } from "../0-domain/entities/User";
import { UserNotFoundError } from "../0-domain/errors/UserNotFoundError";
import { IUserRepository } from "../0-domain/repositories/IUserRepository";
import { IEmailService } from "./ports/IEmailService";
import { IJwtService } from "./ports/IJwtService";
import { IHasherService } from "./ports/IHasherService";
import { WrongPasswordError } from "../0-domain/errors/WrongPasswordError";
import { UserNotVerifiedError } from "../0-domain/errors/UserNotVerifiedError";

export class UserUsecases {
  constructor(
    private _userRepo: IUserRepository,
    private _emailService: IEmailService,
    private _jwtService: IJwtService,
    private _hasherService: IHasherService,
  ) {}

  getAllUsers = async () => {
    return this._userRepo.getAllUsers();
  };

  getUserById = async (id: number) => {
    return this._userRepo.getUserById(id);
  };

  getUserByEmail = async (email: string): Promise<User | null> => {
    return this._userRepo.getUserByEmail(email);
  };

  registerUser = async (email: string) => {
    const user = new User(email);
    await this._userRepo.save(user);
  };

  sendVerificationLinkToEmail = async (email: string) => {
    const jwt = this._jwtService.generateEmailVerificationJwt({ email });
    await this._emailService.sendVerificationLinkToEmail(email, jwt);
  };

  verifyEmailJwt = (token: string) => {
    return this._jwtService.verifyEmailVerificationJwt(token);
  };

  saveUser = (user: User) => {
    return this._userRepo.save(user);
  };

  verifyUserAndSetPassword = async ({
    token,
    password,
  }: {
    token: string;
    password: string;
  }) => {
    const payload = this._jwtService.verifyEmailVerificationJwt(token);
    const email = payload.email;
    const user = await this._userRepo.getUserByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    user.verify();
    user.passwordHash = this._hasherService.hash(password);
    this._userRepo.save(user);
  };

  updateUserDetails = async (user: User) => {};

  loginUser = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const user = await this._userRepo.getUserByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (!user.isVerified() || !user.passwordHash) {
      throw new UserNotVerifiedError();
    }
    if (!this._hasherService.compare(password, user.passwordHash)) {
      throw new WrongPasswordError();
    }

    const refreshToken = this._jwtService.generateRefreshToken({
      email,
      role: user.getRole(),
      userId: user.id as number,
    });
    const accessToken = this._jwtService.generateAccessToken({
      email,
      role: user.getRole(),
      userId: user.id as number,
    });
    return { refreshToken, accessToken };
  };
}
