import { OAuth2Client } from "google-auth-library";
import { IGoogleAuth } from "../../interfaces/auth/IGoogleAuth";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ENV } from "../../../utils/dotenv";
import { v7 as uuidv7 } from "uuid";
import { User } from "../../../domain/entities/User";
import { EventName, EventPayload } from "@skillstew/common";
import { BlockedUserError } from "../../../domain/errors/BlockedUserError";
import { IJwtService } from "../../ports/IJwtService";
import { UserProfile } from "../../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { InvalidCredentialsError } from "../../../domain/errors/InvalidCredentialsError";
import { AccountAuthProviderConflictError } from "../../../domain/errors/AccountAuthProviderConflictError";
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { NotFoundError } from "../../../domain/errors/NotFoundError";

export class GoogleAuth implements IGoogleAuth {
  constructor(
    private _userRepo: IUserRepository,
    private _userProfileRepo: IUserProfileRepository,
    private _OAuthClient: OAuth2Client,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
    private _jwtService: IJwtService,
  ) {}
  exec = async (
    credential: string,
  ): Promise<{ refreshToken: string; accessToken: string }> => {
    const ticket = await this._OAuthClient.verifyIdToken({
      idToken: credential,
      audience: ENV.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload["email"]) {
      throw new InvalidCredentialsError();
    }

    const email = payload["email"];

    let user;
    try {
      user = await this._userRepo.findByEmail(email);
    } catch (err) {
      if (err instanceof NotFoundError) {
        // Handle new user

        const { name, picture: _picture } = payload;

        const newUser = new User(uuidv7(), email, "USER", true, false, true);

        user = await this._unitOfWork.transact(async (tx) => {
          const savedUser = await this._userRepo.create(newUser, tx);

          const newUserProfile = new UserProfile(
            uuidv7(),
            savedUser.id,
            false,
            name,
          );
          const userProfile = await this._userProfileRepo.create(
            newUserProfile,
            tx,
          );

          // user.registered outbox event
          const registeredEventName: EventName = "user.registered";
          const registeredPayload: EventPayload<typeof registeredEventName> = {
            id: savedUser.id,
            email: savedUser.email,
          };
          await this._outboxRepo.create(
            {
              id: uuidv7(),
              name: registeredEventName,
              payload: registeredPayload,
              status: "PENDING",
              createdAt: new Date(),
              processedAt: undefined,
            },
            tx,
          );

          // user.verified outbox event
          const verifiedEventName: EventName = "user.verified";
          const verifiedPayload: EventPayload<typeof verifiedEventName> = {
            id: savedUser.id,
          };
          await this._outboxRepo.create(
            {
              id: uuidv7(),
              name: verifiedEventName,
              payload: verifiedPayload,
              status: "PENDING",
              createdAt: new Date(),
              processedAt: undefined,
            },
            tx,
          );

          // user.profileUpdated outbox event
          const profileEventName: EventName = "user.profileUpdated";
          const profilePayload: EventPayload<typeof profileEventName> = {
            id: userProfile.userId,
            name: userProfile.name,
          };
          await this._outboxRepo.create(
            {
              id: uuidv7(),
              name: profileEventName,
              payload: profilePayload,
              status: "PENDING",
              createdAt: new Date(),
              processedAt: undefined,
            },
            tx,
          );

          return savedUser;
        });
      } else {
        throw err;
      }
    }

    if (user) {
      // Handle existing user
      if (!user.isGoogleLogin) {
        throw new AccountAuthProviderConflictError(
          user.email,
          "local",
          "google",
        );
      }
      if (user.isBlocked) {
        throw new BlockedUserError();
      }
    }

    const tokenPayload = { email, role: user.role, userId: user.id };

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
}
