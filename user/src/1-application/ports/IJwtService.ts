import { UserRoles } from "../../0-domain/entities/UserRoles";

export type tokenBody =
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

export type JWTPayload = tokenBody & {
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
  generateAccessToken(payload: tokenBody, role: UserRoles): string;
  generateRefreshToken(payload: tokenBody, role: UserRoles): string;
  verifyAccessToken(jwtToken: string): JWTPayload;
  verifyRefreshToken(jwtToken: string): JWTPayload;
}
