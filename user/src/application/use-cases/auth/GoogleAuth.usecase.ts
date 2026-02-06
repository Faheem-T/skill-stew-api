import { OAuth2Client } from "google-auth-library";
import { IGoogleAuth } from "../../interfaces/auth/IGoogleAuth";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { ENV } from "../../../utils/dotenv";
import { v7 as uuidv7 } from "uuid";
import { User } from "../../../domain/entities/User";
import { CreateEvent } from "@skillstew/common";
import { BlockedUserError } from "../../../domain/errors/BlockedUserError";
import { IJwtService } from "../../ports/IJwtService";
import { UserProfile } from "../../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";
import { InvalidCredentialsError } from "../../../domain/errors/InvalidCredentialsError";
import { AccountAuthProviderConflictError } from "../../../domain/errors/AccountAuthProviderConflictError";
import { IProducer } from "../../ports/IProducer";
import { NotFoundError } from "../../../domain/errors/NotFoundError";

export class GoogleAuth implements IGoogleAuth {
  constructor(
    private _userRepo: IUserRepository,
    private _userProfileRepo: IUserProfileRepository,
    private _OAuthClient: OAuth2Client,
    private _messageProducer: IProducer,
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

        // Insert new user in db
        const newUser = new User(uuidv7(), email, "USER", true, false, true);

        user = await this._userRepo.create(newUser);

        // Insert new user profile in db
        const newUserProfile = new UserProfile(uuidv7(), user.id, false, name);

        const userProfile = await this._userProfileRepo.create(newUserProfile);

        // emit events
        this._messageProducer.publish(
          CreateEvent(
            "user.registered",
            { id: user.id, email: user.email },
            "user-service",
          ),
        );

        this._messageProducer.publish(
          CreateEvent("user.verified", { id: user.id }, "user-service"),
        );

        this._messageProducer.publish(
          CreateEvent(
            "user.profileUpdated",
            {
              id: userProfile.userId,
              name: userProfile.name,
            },
            "user-service",
          ),
        );
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
