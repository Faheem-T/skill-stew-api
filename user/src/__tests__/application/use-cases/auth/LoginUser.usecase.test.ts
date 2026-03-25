import { describe, expect, it, jest } from "@jest/globals";
import { LoginUser } from "../../../../application/use-cases/auth/LoginUser.usecase";
import { IUserRepository } from "../../../../domain/repositories/IUserRepository";
import { IJwtService } from "../../../../application/ports/IJwtService";
import { IHasherService } from "../../../../application/ports/IHasherService";
import { User } from "../../../../domain/entities/User";
import { AccountAuthProviderConflictError } from "../../../../domain/errors/AccountAuthProviderConflictError";

describe("LoginUser", () => {
  it("allows password login for an account that is linked to google and local auth", async () => {
    const findByEmail = jest
      .fn<IUserRepository["findByEmail"]>()
      .mockResolvedValue(
        new User(
          "user-1",
          "user@example.com",
          "EXPERT_APPLICANT",
          true,
          false,
          true,
          undefined,
          "hashed-password",
        ),
      );
    const generateRefreshToken = jest
      .fn<IJwtService["generateRefreshToken"]>()
      .mockReturnValue("refresh-token");
    const generateAccessToken = jest
      .fn<IJwtService["generateAccessToken"]>()
      .mockReturnValue("access-token");
    const compare = jest.fn<IHasherService["compare"]>().mockReturnValue(true);

    const usecase = new LoginUser(
      { findByEmail } as unknown as IUserRepository,
      {
        generateRefreshToken,
        generateAccessToken,
      } as unknown as IJwtService,
      { compare } as unknown as IHasherService,
    );

    const result = await usecase.exec({
      email: "user@example.com",
      password: "Password1!",
    });

    expect(compare).toHaveBeenCalledWith("Password1!", "hashed-password");
    expect(generateRefreshToken).toHaveBeenCalledWith(
      {
        email: "user@example.com",
        role: "EXPERT_APPLICANT",
        userId: "user-1",
      },
      "EXPERT_APPLICANT",
    );
    expect(result).toEqual({
      refreshToken: "refresh-token",
      accessToken: "access-token",
    });
  });

  it("rejects password login for google-only accounts", async () => {
    const findByEmail = jest
      .fn<IUserRepository["findByEmail"]>()
      .mockResolvedValue(
        new User(
          "user-1",
          "user@example.com",
          "USER",
          true,
          false,
          true,
        ),
      );
    const compare = jest.fn<IHasherService["compare"]>();

    const usecase = new LoginUser(
      { findByEmail } as unknown as IUserRepository,
      {} as IJwtService,
      { compare } as unknown as IHasherService,
    );

    await expect(
      usecase.exec({
        email: "user@example.com",
        password: "Password1!",
      }),
    ).rejects.toBeInstanceOf(AccountAuthProviderConflictError);

    expect(compare).not.toHaveBeenCalled();
  });
});
