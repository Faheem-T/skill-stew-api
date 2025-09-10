import type { PresentationUser } from "../dtos/GetAllUsersDTO";

export interface IAuthUsecases {
  getUserById(id: string): Promise<PresentationUser | null>;
  getUserByEmail(email: string): Promise<PresentationUser | null>;
  registerUser(email: string): Promise<void>;
  sendVerificationLinkToEmail(email: string): Promise<void>;
  verifyUserAndSetPassword(params: {
    token: string;
    password: string;
  }): Promise<void>;
  loginUser(params: {
    email: string;
    password: string;
  }): Promise<{ refreshToken: string; accessToken: string } | null>;
  refresh(params: { refreshToken: string }): string;
  createAdmin(params: { username: string; password: string }): Promise<void>;
  loginAdmin(params: {
    username: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }>;
  googleAuth(
    credential: string,
  ): Promise<{ refreshToken: string; accessToken: string }>;
}
