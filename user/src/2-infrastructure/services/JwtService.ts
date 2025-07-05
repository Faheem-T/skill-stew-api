import {
  EmailVerificationJWTPayload,
  generateEmailVerificationJwtDto,
  generateTokenDto,
  IJwtService,
  JWTPayload,
} from "../../1-application/ports/IJwtService";
import { ENV } from "../../config/dotenv";
import jwt from "jsonwebtoken";
import {
  AccessTokenVerifyError,
  EmailVerificationJwtVerifyError,
  RefreshTokenVerifyError,
} from "../errors/JwtErrors";

export class JwtService implements IJwtService {
  EMAIL_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_EXPIRY_IN_SECONDS: number = 60 * 60 * 24 * 15; // 15 days
  ACCESS_EXPIRY_IN_SECONDS: number = 60 * 10; // 10 minutes
  constructor() {
    this.EMAIL_SECRET = ENV.EMAIL_VERIFICATON_JWT_SECRET;
    this.REFRESH_TOKEN_SECRET = ENV.REFRESH_TOKEN_SECRET;
    this.ACCESS_TOKEN_SECRET = ENV.ACCESS_TOKEN_SECRET;
  }
  generateEmailVerificationJwt(input: generateEmailVerificationJwtDto): string {
    return jwt.sign({ email: input.email }, this.EMAIL_SECRET, {
      expiresIn: 600,
    }); // expires in 10m
  }

  verifyEmailVerificationJwt(
    jwtToken: string,
  ): EmailVerificationJWTPayload | never {
    try {
      const decoded = <EmailVerificationJWTPayload>(
        jwt.verify(jwtToken, this.EMAIL_SECRET)
      );
      return decoded;
    } catch (err) {
      throw new EmailVerificationJwtVerifyError();
    }
  }

  generateRefreshToken = (input: generateTokenDto): string => {
    const { userId, email, role } = input;
    return jwt.sign({ userId, email, role }, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.REFRESH_EXPIRY_IN_SECONDS,
    });
  };

  generateAccessToken = (input: generateTokenDto): string => {
    const { userId, email, role } = input;
    return jwt.sign({ userId, email, role }, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.ACCESS_EXPIRY_IN_SECONDS,
    });
  };

  verifyRefreshToken = (jwtToken: string): JWTPayload => {
    try {
      const decoded = <JWTPayload>(
        jwt.verify(jwtToken, this.REFRESH_TOKEN_SECRET)
      );
      return decoded;
    } catch (err) {
      throw new RefreshTokenVerifyError();
    }
  };

  verifyAccessToken = (jwtToken: string): JWTPayload => {
    try {
      const decoded = <JWTPayload>(
        jwt.verify(jwtToken, this.REFRESH_TOKEN_SECRET)
      );
      return decoded;
    } catch (err) {
      throw new AccessTokenVerifyError();
    }
  };
}
