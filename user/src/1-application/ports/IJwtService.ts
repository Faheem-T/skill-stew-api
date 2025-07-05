import { User, UserRoles } from "../../0-domain/entities/User";

interface JWTPayload {
  userId: Pick<User, "id">;
  role: UserRoles | "ADMIN";
}

interface EmailVerificationJWTPayload {
  email: string;
}

export interface IJwtService {
  generateEmailVerificationJwt(user: User): string;
  verifyEmailVerificationJwt(jwt: string): EmailVerificationJWTPayload;
  // generateAccessToken(user: User): string;
  // generateRefreshToken(user: User): string;
  // verifyAccessToken(jwt: string): JWTPayload;
  // verifyRefreshToken(jwt: string): JWTPayload;
}
