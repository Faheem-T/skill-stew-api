import { User, UserRoles } from "../../0-domain/entities/User";

export interface generateTokenDto {
  userId: number;
  email: string;
  role: UserRoles | "ADMIN";
}

export interface JWTPayload extends generateTokenDto {
  iat: number;
  exp: number;
}

export interface generateEmailVerificationJwtDto {
  email: string;
}

export interface EmailVerificationJWTPayload
  extends generateEmailVerificationJwtDto {
  iat: number;
  exp: number;
}

export interface IJwtService {
  generateEmailVerificationJwt(input: generateEmailVerificationJwtDto): string;
  verifyEmailVerificationJwt(
    jwtToken: string,
  ): EmailVerificationJWTPayload | never;
  generateAccessToken(input: generateTokenDto): string;
  generateRefreshToken(input: generateTokenDto): string;
  verifyAccessToken(jwtToken: string): JWTPayload;
  verifyRefreshToken(jwtToken: string): JWTPayload;
}
