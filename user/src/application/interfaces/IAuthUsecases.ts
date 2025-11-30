import { UserRoles } from "@skillstew/common";
import type { PresentationUser } from "../dtos/GetAllUsersDTO";
import type { GetProfileOutputDTO } from "../dtos/GetProfileDTO";
import { Admin } from "../../domain/entities/Admin";
import { RegisterOutputDTO } from "../dtos/RegisterDTO";

export interface IAuthUsecases {
  getUserById(id: string): Promise<PresentationUser | null>;
  getUserByEmail(email: string): Promise<PresentationUser | null>;
  registerUser(email: string, password: string): Promise<RegisterOutputDTO>;
  sendVerificationLinkToEmail(email: string): Promise<void>;
  verifyUser(params: { token: string }): Promise<void>;
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
  getAdminById(id: string): Promise<Admin | null>;
}
