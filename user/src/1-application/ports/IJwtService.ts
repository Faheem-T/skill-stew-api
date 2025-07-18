import { UserRoles } from "../../0-domain/entities/UserRoles";

export type generateTokenDto =
  | {
      userId: string;
      email: string;
      role: Exclude<UserRoles, "ADMIN">;
    }
  | {
      userId: string;
      username: string;
      role: "ADMIN";
    };

export type JWTPayload = generateTokenDto & {
  iat: number;
  exp: number;
};

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
