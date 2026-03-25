import { describe, expect, it, jest } from "@jest/globals";
import { OAuth2Client } from "google-auth-library";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";
import { IUserProfileRepository } from "../../../../domain/repositories/IUserProfileRepository";
import { IOutboxEventRepository } from "../../../../domain/repositories/IOutboxEventRepository";
import { IUnitOfWork } from "../../../../application/ports/IUnitOfWork";
import { IJwtService } from "../../../../application/ports/IJwtService";
import { NotFoundError } from "../../../../domain/errors/NotFoundError";
import { User } from "../../../../domain/entities/User";
import { UserProfile } from "../../../../domain/entities/UserProfile";
import { BlockedUserError } from "../../../../domain/errors/BlockedUserError";

jest.mock("uuid", () => ({
  v7: () => "test-uuid",
}));

describe("GoogleAuth", () => {
  const verifiedPayload = {
    email: "expert@example.com",
    name: "Expert User",
  };

  const buildUsecase = async ({
    existingUser,
    updatedUser,
  }: {
    existingUser?: User;
    updatedUser?: User;
  } = {}) => {
    process.env.PORT = process.env.PORT ?? "3000";
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgres://test";
    process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
    process.env.EMAIL_VERIFICATON_JWT_SECRET =
      process.env.EMAIL_VERIFICATON_JWT_SECRET ?? "email-secret";
    process.env.USER_ACCESS_TOKEN_SECRET =
      process.env.USER_ACCESS_TOKEN_SECRET ?? "user-access-secret";
    process.env.USER_REFRESH_TOKEN_SECRET =
      process.env.USER_REFRESH_TOKEN_SECRET ?? "user-refresh-secret";
    process.env.EXPERT_ACCESS_TOKEN_SECRET =
      process.env.EXPERT_ACCESS_TOKEN_SECRET ?? "expert-access-secret";
    process.env.EXPERT_REFRESH_TOKEN_SECRET =
      process.env.EXPERT_REFRESH_TOKEN_SECRET ?? "expert-refresh-secret";
    process.env.ADMIN_ACCESS_TOKEN_SECRET =
      process.env.ADMIN_ACCESS_TOKEN_SECRET ?? "admin-access-secret";
    process.env.ADMIN_REFRESH_TOKEN_SECRET =
      process.env.ADMIN_REFRESH_TOKEN_SECRET ?? "admin-refresh-secret";
    process.env.NODE_MAILER_HOST = process.env.NODE_MAILER_HOST ?? "localhost";
    process.env.NODE_MAILER_PORT = process.env.NODE_MAILER_PORT ?? "1025";
    process.env.NODE_MAILER_GMAIL =
      process.env.NODE_MAILER_GMAIL ?? "test@example.com";
    process.env.NODE_MAILER_GMAIL_APP_PASSWORD =
      process.env.NODE_MAILER_GMAIL_APP_PASSWORD ?? "password";
    process.env.BASE_SERVER_URL =
      process.env.BASE_SERVER_URL ?? "http://localhost:3000";
    process.env.BASE_FRONTEND_URL =
      process.env.BASE_FRONTEND_URL ?? "http://localhost:5173";
    process.env.GOOGLE_CLIENT_ID =
      process.env.GOOGLE_CLIENT_ID ?? "google-client-id";
    process.env.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME ?? "bucket";
    process.env.CDN_DOMAIN_NAME =
      process.env.CDN_DOMAIN_NAME ?? "cdn.example.com";
    process.env.RABBIT_MQ_CONNECTION_STRING =
      process.env.RABBIT_MQ_CONNECTION_STRING ?? "amqp://localhost";

    const { GoogleAuth } = await import(
      "../../../../application/use-cases/auth/GoogleAuth.usecase"
    );

    const findByEmail = jest
      .fn<IUserRepository["findByEmail"]>()
      .mockImplementation(async () => {
        if (!existingUser) {
          throw new NotFoundError("User");
        }

        return existingUser;
      });

    const create = jest
      .fn<IUserRepository["create"]>()
      .mockImplementation(async (user) => user);

    const update = jest
      .fn<IUserRepository["update"]>()
      .mockImplementation(async () => {
        if (!updatedUser) {
          throw new Error("updatedUser mock is required");
        }

        return updatedUser;
      });

    const userRepo = {
      findByEmail,
      create,
      update,
    } as unknown as IUserRepository;

    const createProfile = jest
      .fn<IUserProfileRepository["create"]>()
      .mockImplementation(async (profile) => profile);

    const userProfileRepo = {
      create: createProfile,
    } as unknown as IUserProfileRepository;

    const verifyIdToken = jest
      .fn<OAuth2Client["verifyIdToken"]>()
      .mockImplementation(async () => ({
        getPayload: () => verifiedPayload,
      }) as any);

    const oauthClient = {
      verifyIdToken,
    } as unknown as OAuth2Client;

    const createOutboxEvent = jest
      .fn<IOutboxEventRepository["create"]>()
      .mockResolvedValue();

    const outboxRepo = {
      create: createOutboxEvent,
    } as unknown as IOutboxEventRepository;

    const transact = jest
      .fn<IUnitOfWork["transact"]>()
      .mockImplementation(async (work) => work({} as any));

    const unitOfWork = {
      transact,
    } as IUnitOfWork;

    const generateRefreshToken = jest
      .fn<IJwtService["generateRefreshToken"]>()
      .mockReturnValue("refresh-token");
    const generateAccessToken = jest
      .fn<IJwtService["generateAccessToken"]>()
      .mockReturnValue("access-token");

    const jwtService = {
      generateRefreshToken,
      generateAccessToken,
    } as unknown as IJwtService;

    const usecase = new GoogleAuth(
      userRepo,
      userProfileRepo,
      oauthClient,
      outboxRepo,
      unitOfWork,
      jwtService,
    );

    return {
      usecase,
      findByEmail,
      create,
      update,
      createProfile,
      verifyIdToken,
      createOutboxEvent,
      generateRefreshToken,
      generateAccessToken,
    };
  };

  it("creates a verified user with profile and user events on first-time google signup", async () => {
    const {
      usecase,
      create,
      createProfile,
      createOutboxEvent,
      generateAccessToken,
      generateRefreshToken,
    } = await buildUsecase();

    const result = await usecase.exec({
      credential: "google-credential",
      requestedRole: "USER",
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "expert@example.com",
        role: "USER",
        isVerified: true,
        hasGoogleAuth: true,
        passwordHash: undefined,
      }),
      expect.anything(),
    );
    expect(createProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: expect.any(String),
        name: "Expert User",
      }),
      expect.anything(),
    );
    expect(createOutboxEvent).toHaveBeenCalledTimes(3);
    expect(createOutboxEvent.mock.calls.map(([event]) => event.name)).toEqual([
      "user.registered",
      "user.verified",
      "user.profileUpdated",
    ]);
    expect(generateRefreshToken).toHaveBeenCalledWith(
      expect.objectContaining({ role: "USER" }),
      "USER",
    );
    expect(generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ role: "USER" }),
      "USER",
    );
    expect(result).toEqual({
      refreshToken: "refresh-token",
      accessToken: "access-token",
    });
  });

  it("creates a verified expert applicant and expert events on first-time google signup", async () => {
    const {
      usecase,
      create,
      createProfile,
      createOutboxEvent,
      generateAccessToken,
    } = await buildUsecase();

    await usecase.exec({
      credential: "google-credential",
      requestedRole: "EXPERT_APPLICANT",
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "expert@example.com",
        role: "EXPERT_APPLICANT",
        isVerified: true,
        hasGoogleAuth: true,
      }),
      expect.anything(),
    );
    expect(createProfile).not.toHaveBeenCalled();
    expect(createOutboxEvent).toHaveBeenCalledTimes(2);
    expect(createOutboxEvent.mock.calls.map(([event]) => event.name)).toEqual([
      "expert.registered",
      "expert.verified",
    ]);
    expect(generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ role: "EXPERT_APPLICANT" }),
      "EXPERT_APPLICANT",
    );
  });

  it("auto-links an existing local-only user and emits auth.providerLinked", async () => {
    const existingUser = new User(
      "user-1",
      "expert@example.com",
      "USER",
      true,
      false,
      false,
      undefined,
      "hashed-password",
    );
    const updatedUser = new User(
      "user-1",
      "expert@example.com",
      "USER",
      true,
      false,
      true,
      undefined,
      "hashed-password",
    );
    const { usecase, update, createOutboxEvent, create } = await buildUsecase({
      existingUser,
      updatedUser,
    });

    await usecase.exec({
      credential: "google-credential",
      requestedRole: "EXPERT_APPLICANT",
    });

    expect(create).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ hasGoogleAuth: true }),
      expect.anything(),
    );
    expect(createOutboxEvent).toHaveBeenCalledTimes(1);
    expect(createOutboxEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "auth.providerLinked",
        payload: {
          userId: "user-1",
          email: "expert@example.com",
          role: "USER",
          provider: "google",
        },
      }),
      expect.anything(),
    );
  });

  it("rejects blocked users before linking or token issuance", async () => {
    const blockedUser = new User(
      "user-1",
      "expert@example.com",
      "EXPERT",
      true,
      true,
      false,
      undefined,
      "hashed-password",
    );
    const { usecase, update, createOutboxEvent, generateAccessToken } =
      await buildUsecase({
        existingUser: blockedUser,
        updatedUser: blockedUser,
      });

    await expect(
      usecase.exec({
        credential: "google-credential",
        requestedRole: "USER",
      }),
    ).rejects.toBeInstanceOf(BlockedUserError);

    expect(update).not.toHaveBeenCalled();
    expect(createOutboxEvent).not.toHaveBeenCalled();
    expect(generateAccessToken).not.toHaveBeenCalled();
  });
});
