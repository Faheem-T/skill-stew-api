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
import { IOutboxEventRepository } from "../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../ports/IUnitOfWork";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { GoogleAuthDTO } from "../../dtos/auth/GoogleAuth.dto";

export class GoogleAuth implements IGoogleAuth {
  constructor(
    private _userRepo: IUserRepository,
    private _userProfileRepo: IUserProfileRepository,
    private _OAuthClient: OAuth2Client,
    private _outboxRepo: IOutboxEventRepository,
    private _unitOfWork: IUnitOfWork,
    private _jwtService: IJwtService,
  ) {}
  exec = async ({
    credential,
    requestedRole,
  }: GoogleAuthDTO): Promise<{ refreshToken: string; accessToken: string }> => {
    const ticket = await this._OAuthClient.verifyIdToken({
      idToken: credential,
      audience: ENV.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload["email"]) {
      throw new InvalidCredentialsError();
    }

    const email = payload["email"];
    const name = payload["name"];

    let user: User;
    try {
      user = await this._userRepo.findByEmail(email);
    } catch (err) {
      if (err instanceof NotFoundError) {
        user =
          requestedRole === "EXPERT_APPLICANT"
            ? await this.createGoogleExpertApplicant(email)
            : await this.createGoogleUser(email, name);
      } else {
        throw err;
      }
    }

    if (user.isBlocked) {
      throw new BlockedUserError();
    }

    if (!user.hasGoogleAuth) {
      user = await this.linkGoogleAuth(user);
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

  private createGoogleUser = async (
    email: string,
    name?: string,
  ): Promise<User> => {
    const newUser = new User(uuidv7(), email, "USER", true, false, true);

    return this._unitOfWork.transact(async (tx) => {
      const savedUser = await this._userRepo.create(newUser, tx);
      const newUserProfile = new UserProfile(
        uuidv7(),
        savedUser.id,
        false,
        name,
      );
      const userProfile = await this._userProfileRepo.create(newUserProfile, tx);

      const registeredEventName: EventName = "user.registered";
      const registeredPayload: EventPayload<typeof registeredEventName> = {
        id: savedUser.id,
        email: savedUser.email,
      };
      await this.createOutboxEvent(registeredEventName, registeredPayload, tx);

      const verifiedEventName: EventName = "user.verified";
      const verifiedPayload: EventPayload<typeof verifiedEventName> = {
        id: savedUser.id,
      };
      await this.createOutboxEvent(verifiedEventName, verifiedPayload, tx);

      const profileEventName: EventName = "user.profileUpdated";
      const profilePayload: EventPayload<typeof profileEventName> = {
        id: userProfile.userId,
        name: userProfile.name,
      };
      await this.createOutboxEvent(profileEventName, profilePayload, tx);

      return savedUser;
    });
  };

  private createGoogleExpertApplicant = async (email: string): Promise<User> => {
    const expertApplicant = new User(
      uuidv7(),
      email,
      "EXPERT_APPLICANT",
      true,
      false,
      true,
    );

    return this._unitOfWork.transact(async (tx) => {
      const savedUser = await this._userRepo.create(expertApplicant, tx);

      const registeredEventName: EventName = "expert.registered";
      const registeredPayload: EventPayload<typeof registeredEventName> = {
        id: savedUser.id,
        email: savedUser.email,
      };
      await this.createOutboxEvent(registeredEventName, registeredPayload, tx);

      const verifiedEventName: EventName = "expert.verified";
      const verifiedPayload: EventPayload<typeof verifiedEventName> = {
        id: savedUser.id,
      };
      await this.createOutboxEvent(verifiedEventName, verifiedPayload, tx);

      return savedUser;
    });
  };

  private linkGoogleAuth = async (user: User): Promise<User> => {
    return this._unitOfWork.transact(async (tx) => {
      const updatedUser = await this._userRepo.update(
        user.id,
        {
          hasGoogleAuth: true,
          updatedAt: new Date(),
        },
        tx,
      );

      const eventName: EventName = "auth.providerLinked";
      const payload: EventPayload<typeof eventName> = {
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        provider: "google",
      };
      await this.createOutboxEvent(eventName, payload, tx);

      return updatedUser;
    });
  };

  private createOutboxEvent = async <T extends EventName>(
    name: T,
    payload: EventPayload<T>,
    tx: Parameters<IOutboxEventRepository["create"]>[1],
  ): Promise<void> => {
    await this._outboxRepo.create(
      {
        id: uuidv7(),
        name,
        payload,
        status: "PENDING",
        createdAt: new Date(),
        processedAt: undefined,
      },
      tx,
    );
  };
}
