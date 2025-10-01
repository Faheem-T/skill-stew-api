import { User } from "../domain/entities/User";
import { UserNotFoundError } from "../domain/errors/UserNotFoundError";
import { IUserRepository } from "../domain/repositories/IUserRepository";
import { IEmailService } from "./ports/IEmailService";
import { IJwtService } from "./ports/IJwtService";
import { IHasherService } from "./ports/IHasherService";
import { WrongPasswordError } from "../domain/errors/WrongPasswordError";
import { UserNotVerifiedError } from "../domain/errors/UserNotVerifiedError";
import { IAdminRepository } from "../domain/repositories/IAdminRepository";
import { Admin } from "../domain/entities/Admin";
import { WrongAdminUsernameError } from "../domain/errors/WrongAdminUsernameError";
import { UserBlockedError } from "../domain/errors/UserBlockedError";
import { IProducer } from "./ports/IProducer";
import { CreateEvent, UserRoles } from "@skillstew/common";
import { OAuth2Client } from "google-auth-library";
import { GoogleAuthError } from "./errors/GoogleAuthErrors";
import { ENV } from "../utils/dotenv";
import { IAuthUsecases } from "./interfaces/IAuthUsecases";
import { UserDTOMapper } from "./mappers/UserDTOMapper";
import { GetProfileOutputDTO } from "./dtos/GetProfileDTO";
import { DomainValidationError } from "../domain/errors/DomainValidationError";
import { RegisterOutputDTO } from "./dtos/RegisterDTO";

export class AuthUsecases implements IAuthUsecases {
  constructor(
    private _userRepo: IUserRepository,
    private _emailService: IEmailService,
    private _jwtService: IJwtService,
    private _hasherService: IHasherService,
    private _adminRepo: IAdminRepository,
    private _messageProducer: IProducer,
    private _OAuthClient: OAuth2Client,
  ) {}

  getUserById = async (id: string) => {
    const user = await this._userRepo.getUserById(id);
    if (!user) return null;
    return UserDTOMapper.toPresentation(user);
  };

  getUserByEmail = async (email: string) => {
    const user = await this._userRepo.getUserByEmail(email);
    if (!user) return null;
    return UserDTOMapper.toPresentation(user);
  };

  registerUser = async (email: string): Promise<RegisterOutputDTO> => {
    const existingUser = await this._userRepo.getUserByEmail(email);
    if (existingUser) {
      if (existingUser.isVerified) {
        return { success: false, userAlreadyExists: true, userVerified: true };
      } else {
        return { success: false, userAlreadyExists: true, userVerified: false };
      }
    }
    const user = new User({ email, isGoogleLogin: false });
    const savedUser = await this._userRepo.save(user);
    const event = CreateEvent(
      "user.registered",
      {
        id: savedUser.id!,
        email: savedUser.email,
      },
      "user",
    );
    this._messageProducer.publish(event);
    return { success: true };
  };

  sendVerificationLinkToEmail = async (email: string) => {
    const user = await this._userRepo.getUserByEmail(email);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (user.isVerified) {
      throw new DomainValidationError("USER_ALREADY_VERIFIED");
    }
    const jwt = this._jwtService.generateEmailVerificationJwt({ email });
    await this._emailService.sendVerificationLinkToEmail(email, jwt);
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
    if (user.isVerified) {
      throw new DomainValidationError("USER_ALREADY_VERIFIED");
    }
    user.isVerified = true;
    user.passwordHash = this._hasherService.hash(password);
    await this._userRepo.save(user);
    this._messageProducer.publish(
      CreateEvent("user.verified", { id: user.id! }, "user-service"),
    );
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
      return null;
    }
    if (user.isGoogleLogin) {
      throw new GoogleAuthError("GOOGLE_ACCOUNT_EXISTS");
    }
    if (!user.isVerified || !user.passwordHash) {
      throw new UserNotVerifiedError();
    }
    if (!this._hasherService.compare(password, user.passwordHash)) {
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

  googleAuth = async (credential: string) => {
    const ticket = await this._OAuthClient.verifyIdToken({
      idToken: credential,
      audience: ENV.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload["email"]) {
      throw new GoogleAuthError("INVALID_GOOGLE_AUTH_CREDENTIAL");
    }

    const email = payload["email"];

    let user = await this._userRepo.getUserByEmail(email);

    if (!user) {
      // Handle new user
      const { name, picture } = payload;
      const newUser = new User({ email, isGoogleLogin: true });
      newUser.avatarUrl = picture;
      newUser.name = name;
      newUser.isVerified = true;

      user = await this._userRepo.save(newUser);

      // emit event
      const event = CreateEvent(
        "user.registered",
        { id: user.id!, email: user.email },
        "user-service",
      );

      this._messageProducer.publish(event);

      const vEvent = CreateEvent(
        "user.verified",
        { id: user.id! },
        "user-service",
      );
      console.log(vEvent);
      this._messageProducer.publish(vEvent);
    } else {
      if (!user.isGoogleLogin) {
        throw new GoogleAuthError("LOCAL_ACCOUNT_EXISTS");
      }
      if (user.isBlocked) {
        throw new UserBlockedError();
      }
    }

    const tokenPayload = { email, role: user.role, userId: user.id! };
    const refreshToken = this._jwtService.generateRefreshToken(
      tokenPayload,
      user.role,
    );
    const accessToken = this._jwtService.generateAccessToken(
      tokenPayload,
      user.role,
    );
    return { refreshToken, accessToken };
  };

  getAdminById = async (id: string): Promise<Admin | null> => {
    const admin = await this._adminRepo.getAdminById(id);
    if (!admin) return null;
    return admin;
  };

  getProfile = async (
    userId: string,
    role: UserRoles,
  ): Promise<GetProfileOutputDTO> => {
    if (role === "USER") {
      const user = await this.getUserById(userId);
      if (!user) return null;
      const { id, email, username, name } = user;
      return { id, email, username, name, role };
    } else {
      // HANDLE EXPERT ALSO
      const admin = await this.getAdminById(userId);
      if (!admin) return null;
      const { username } = admin;
      const id = admin.id!;
      return { id, username, role: "ADMIN" };
    }
  };
}
