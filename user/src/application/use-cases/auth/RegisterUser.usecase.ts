import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { IRegisterUser } from "../../interfaces/auth/IRegisterUser";
import { IHasherService } from "../../ports/IHasherService";
import { EventName, EventPayload } from "@skillstew/common";
import { User } from "../../../domain/entities/User";
import { v7 as uuidv7 } from "uuid";
import { IJwtService } from "../../ports/IJwtService";
import { UserProfile } from "../../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { RegisterDTO, RegisterOutputDTO } from "../../dtos/auth/Register.dto";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { NotFoundError } from "../../../domain/errors/NotFoundError";

export class RegisterUser implements IRegisterUser {
  constructor(
    private _userRepo: IUserRepository,
    private _userProfileRepo: IUserProfileRepository,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
    private _hasherService: IHasherService,
    private _jwtService: IJwtService,
  ) {}
  exec = async ({
    email,
    password,
  }: RegisterDTO): Promise<RegisterOutputDTO> => {
    try {
      const existingUser = await this._userRepo.findByEmail(email);
      if (existingUser) {
        return { success: false, userAlreadyExists: true };
      }
    } catch (err) {
      if (!(err instanceof NotFoundError)) {
        throw err;
      }
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

    const savedUser = await this._unitOfWork.transact(async (tx) => {
      const savedUser = await this._userRepo.create(user, tx);

      const profile = new UserProfile(uuidv7(), savedUser.id, false);
      await this._userProfileRepo.create(profile, tx);

      const eventName: EventName = "user.registered";
      const payload: EventPayload<typeof eventName> = {
        id: savedUser.id,
        email: savedUser.email,
      };

      await this._outboxRepo.create(
        {
          id: uuidv7(),
          name: eventName,
          payload,
          status: "PENDING",
          createdAt: new Date(),
          processedAt: undefined,
        },
        tx,
      );

      return savedUser;
    });

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
