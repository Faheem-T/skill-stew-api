import { OAuth2Client } from "google-auth-library";
import { IGoogleAuth } from "../../interfaces/auth/IGoogleAuth";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { GoogleAuthError } from "../../errors/GoogleAuthErrors";
import { ENV } from "../../../utils/dotenv";
import { v7 as uuidv7 } from "uuid";
import { User } from "../../../domain/entities/User";
import { Producer, CreateEvent } from "@skillstew/common";
import { UserBlockedError } from "../../../domain/errors/UserBlockedError";
import { IJwtService } from "../../ports/IJwtService";
import { UserProfile } from "../../../domain/entities/UserProfile";
import { IUserProfileRepository } from "../../../domain/repositories/IUserProfileRepository";

export class GoogleAuth implements IGoogleAuth {
  constructor(
    private _userRepo: IUserRepository,
    private _userProfileRepo: IUserProfileRepository,
    private _OAuthClient: OAuth2Client,
    private _messageProducer: Producer,
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
      throw new GoogleAuthError("INVALID_GOOGLE_AUTH_CREDENTIAL");
    }

    const email = payload["email"];

    let user = await this._userRepo.findByEmail(email);

    if (!user) {
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
      // Handle existing user

      if (!user.isGoogleLogin) {
        throw new GoogleAuthError("LOCAL_ACCOUNT_EXISTS");
      }
      if (user.isBlocked) {
        throw new UserBlockedError();
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
