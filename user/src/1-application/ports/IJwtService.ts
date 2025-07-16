import { UserRoles } from "../../0-domain/entities/UserRoles";

export interface generateTokenDto {
  userId: string;
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
  generateAccessToken(payload: generateTokenDto, role: UserRoles): string;
  generateRefreshToken(payload: generateTokenDto, role: UserRoles): string;
  verifyAccessToken(jwtToken: string): JWTPayload;
  verifyRefreshToken(jwtToken: string): JWTPayload;
}
