import { User } from "../../0-domain/entities/User";
export interface IAuthUsecases {
  getUserById(id: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  registerUser(email: string): Promise<void>;
  sendVerificationLinkToEmail(email: string): Promise<void>;
  verifyEmailJwt(token: string): any; // adjust type based on your JWT payload
  saveUser(user: User): Promise<User>;
  verifyUserAndSetPassword(params: { token: string; password: string }): Promise<void>;
  loginUser(params: { email: string; password: string }): Promise<{ refreshToken: string; accessToken: string } | null>;
  refresh(params: { refreshToken: string }): string;
  createAdmin(params: { username: string; password: string }): Promise<void>;
  loginAdmin(params: { username: string; password: string }): Promise<{ accessToken: string; refreshToken: string }>;
  googleAuth(credential: string): Promise<{ refreshToken: string; accessToken: string }>;
}
