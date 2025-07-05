import { User, UserRoles } from "../../0-domain/entities/User";

export interface JWTPayload {
  userId: Pick<User, "id">;
  role: UserRoles | "ADMIN";
}

export interface EmailVerificationJWTPayload {
  email: string;
}

export interface IJwtService {
  generateEmailVerificationJwt(email: string): string;
  verifyEmailVerificationJwt(jwt: string): EmailVerificationJWTPayload | never;
  // generateAccessToken(user: User): string;
  // generateRefreshToken(user: User): string;
  // verifyAccessToken(jwt: string): JWTPayload;
  // verifyRefreshToken(jwt: string): JWTPayload;
}
