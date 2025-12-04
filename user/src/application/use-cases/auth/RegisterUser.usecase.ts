import { Producer } from "@skillstew/common";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { RegisterOutputDTO } from "../../dtos/RegisterDTO";
import { IRegisterUser } from "../../interfaces/auth/IRegisterUser";
import { IHasherService } from "../../ports/IHasherService";
import { CreateEvent } from "@skillstew/common";
import { User } from "../../../domain/entities/User";
import { v7 as uuidv7 } from "uuid";
import { IJwtService } from "../../ports/IJwtService";
import { UserProfile } from "../../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";

export class RegisterUser implements IRegisterUser {
  constructor(
    private _userRepo: IUserRepository,
    private _userProfileRepo: IUserProfileRepository,
    private _messageProducer: Producer,
    private _hasherService: IHasherService,
    private _jwtService: IJwtService,
  ) {}
  exec = async (
    email: string,
    password: string,
  ): Promise<RegisterOutputDTO> => {
    const existingUser = await this._userRepo.findByEmail(email);
    if (existingUser) {
      return { success: false, userAlreadyExists: true };
    }
    const passwordHash = this._hasherService.hash(password);
    const user = new User(
      uuidv7(),
      email,
      "USER",
      false,
      false,
      false,
      undefined,
      passwordHash,
    );

    const savedUser = await this._userRepo.create(user);

    const profile = new UserProfile(uuidv7(), savedUser.id, false);
    await this._userProfileRepo.create(profile);

    this._messageProducer.publish(
      CreateEvent(
        "user.registered",
        {
          id: savedUser.id,
          email: savedUser.email,
        },
        "user",
      ),
    );

    const userId = savedUser.id;
    const role = savedUser.role;

    // TODO: Don't log in user after register

    const refreshToken = this._jwtService.generateRefreshToken(
      {
        email,
        role,
        userId,
      },
      role,
    );
    const accessToken = this._jwtService.generateAccessToken(
      {
        email,
        role,
        userId,
      },
      role,
    );

    return { refreshToken, accessToken, success: true };
  };
}
