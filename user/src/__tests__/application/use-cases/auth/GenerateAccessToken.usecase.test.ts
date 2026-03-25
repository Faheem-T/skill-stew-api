import { describe, expect, it, jest } from "@jest/globals";
import { GenerateAccessToken } from "../../../../application/use-cases/auth/GenerateAccessToken.usecase";
import { IJwtService, JWTPayload } from "../../../../application/ports/IJwtService";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";
import { User } from "../../../../domain/entities/User";
import { InvalidAuthTokenError } from "../../../../application/errors/infra/InvalidAuthTokenError";
import { NotFoundError } from "../../../../domain/errors/NotFoundError";

describe("GenerateAccessToken", () => {
  const applicantPayload: JWTPayload = {
    userId: "user-1",
    email: "applicant@example.com",
    role: "EXPERT_APPLICANT",
    iat: 1,
    exp: 2,
  };

  it("generates an access token when the refresh token role still matches the persisted applicant role", async () => {
    const verifyRefreshToken = jest
      .fn<IJwtService["verifyRefreshToken"]>()
      .mockReturnValue(applicantPayload);
    const generateAccessToken = jest
      .fn<IJwtService["generateAccessToken"]>()
      .mockReturnValue("access-token");
    const findById = jest
      .fn<IUserRepository["findById"]>()
      .mockResolvedValue(
        new User(
          "user-1",
          "applicant@example.com",
          "EXPERT_APPLICANT",
          true,
          false,
          false,
        ),
      );

    const usecase = new GenerateAccessToken(
      {
        verifyRefreshToken,
        generateAccessToken,
      } as unknown as IJwtService,
      { findById } as unknown as IUserRepository,
    );

    const result = await usecase.exec("refresh-token");

    expect(verifyRefreshToken).toHaveBeenCalledWith("refresh-token");
    expect(findById).toHaveBeenCalledWith("user-1");
    expect(generateAccessToken).toHaveBeenCalledWith(
      {
        userId: "user-1",
        role: "EXPERT_APPLICANT",
        email: "applicant@example.com",
      },
      "EXPERT_APPLICANT",
    );
    expect(result).toBe("access-token");
  });

  it("rejects refresh when an applicant token belongs to a user who has been promoted to expert", async () => {
    const verifyRefreshToken = jest
      .fn<IJwtService["verifyRefreshToken"]>()
      .mockReturnValue(applicantPayload);
    const generateAccessToken = jest.fn<IJwtService["generateAccessToken"]>();
    const findById = jest
      .fn<IUserRepository["findById"]>()
      .mockResolvedValue(
        new User(
          "user-1",
          "applicant@example.com",
          "EXPERT",
          true,
          false,
          false,
        ),
      );

    const usecase = new GenerateAccessToken(
      {
        verifyRefreshToken,
        generateAccessToken,
      } as unknown as IJwtService,
      { findById } as unknown as IUserRepository,
    );

    await expect(usecase.exec("refresh-token")).rejects.toBeInstanceOf(
      InvalidAuthTokenError,
    );

    expect(findById).toHaveBeenCalledWith("user-1");
    expect(generateAccessToken).not.toHaveBeenCalled();
  });

  it("propagates repository not-found errors for applicant refresh validation", async () => {
    const verifyRefreshToken = jest
      .fn<IJwtService["verifyRefreshToken"]>()
      .mockReturnValue(applicantPayload);
    const generateAccessToken = jest.fn<IJwtService["generateAccessToken"]>();
    const findById = jest
      .fn<IUserRepository["findById"]>()
      .mockRejectedValue(new NotFoundError("User"));

    const usecase = new GenerateAccessToken(
      {
        verifyRefreshToken,
        generateAccessToken,
      } as unknown as IJwtService,
      { findById } as unknown as IUserRepository,
    );

    await expect(usecase.exec("refresh-token")).rejects.toBeInstanceOf(
      NotFoundError,
    );

    expect(generateAccessToken).not.toHaveBeenCalled();
  });

  it("generates an access token for non-applicant roles without consulting the user repository", async () => {
    const verifyRefreshToken = jest
      .fn<IJwtService["verifyRefreshToken"]>()
      .mockReturnValue({
        userId: "user-2",
        email: "expert@example.com",
        role: "EXPERT",
        iat: 1,
        exp: 2,
      });
    const generateAccessToken = jest
      .fn<IJwtService["generateAccessToken"]>()
      .mockReturnValue("expert-access-token");
    const findById = jest.fn<IUserRepository["findById"]>();

    const usecase = new GenerateAccessToken(
      {
        verifyRefreshToken,
        generateAccessToken,
      } as unknown as IJwtService,
      { findById } as unknown as IUserRepository,
    );

    const result = await usecase.exec("refresh-token");

    expect(findById).not.toHaveBeenCalled();
    expect(generateAccessToken).toHaveBeenCalledWith(
      {
        userId: "user-2",
        role: "EXPERT",
        email: "expert@example.com",
      },
      "EXPERT",
    );
    expect(result).toBe("expert-access-token");
  });
});
