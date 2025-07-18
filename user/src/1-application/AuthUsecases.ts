import { User } from "../0-domain/entities/User";
import { UserNotFoundError } from "../0-domain/errors/UserNotFoundError";
import { IUserRepository } from "../0-domain/repositories/IUserRepository";
import { IEmailService } from "./ports/IEmailService";
import { IJwtService } from "./ports/IJwtService";
import { IHasherService } from "./ports/IHasherService";
import { WrongPasswordError } from "../0-domain/errors/WrongPasswordError";
import { UserNotVerifiedError } from "../0-domain/errors/UserNotVerifiedError";
import { IAdminRepository } from "../0-domain/repositories/IAdminRepository";
import { Admin } from "../0-domain/entities/Admin";
import { WrongAdminUsernameError } from "../0-domain/errors/WrongAdminUsernameError";
import { UserBlockedError } from "../0-domain/errors/UserBlockedError";

export class AuthUsecases {
  constructor(
    private _userRepo: IUserRepository,
    private _emailService: IEmailService,
    private _jwtService: IJwtService,
    private _hasherService: IHasherService,
    private _adminRepo: IAdminRepository,
  ) {}

  getUserById = async (id: string) => {
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
    if (user.isBlocked) {
      throw new UserBlockedError();
    }

    const role = user.getRole();
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

  refresh = ({ refreshToken }: { refreshToken: string }) => {
    const decoded = this._jwtService.verifyRefreshToken(refreshToken);
    const role = decoded.role;
    const userId = decoded.userId;
    const payload = {
      userId,
      ...(role === "ADMIN"
        ? { role, username: decoded.username }
        : { role, email: decoded.email }),
    };
    return this._jwtService.generateAccessToken(payload, decoded.role);
  };

  createAdmin = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const passwordHash = this._hasherService.hash(password);
    const newAdmin = new Admin(username, passwordHash);
    await this._adminRepo.create(newAdmin);
  };

  loginAdmin = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    const admin = await this._adminRepo.getAdminByUsername(username);
    if (!admin) {
      throw new WrongAdminUsernameError();
    }
    if (!this._hasherService.compare(password, admin.passwordHash)) {
      throw new WrongPasswordError();
    }

    const accessToken = this._jwtService.generateAccessToken(
      {
        role: "ADMIN",
        userId: admin.id as string,
        username: admin.username,
      },
      "ADMIN",
    );

    const refreshToken = this._jwtService.generateRefreshToken(
      {
        role: "ADMIN",
        userId: admin.id as string,
        username: admin.username,
      },
      "ADMIN",
    );

    return { accessToken, refreshToken };
  };
}
