import {
  EmailVerificationJWTPayload,
  generateEmailVerificationJwtDto,
  tokenBody,
  IJwtService,
  JWTPayload,
} from "../../1-application/ports/IJwtService";
import jwt, { JwtHeader } from "jsonwebtoken";
import {
  AccessTokenVerifyError,
  EmailVerificationJwtVerifyError,
  InvalidTokenError,
  InvalidTokenRoleError,
  RefreshTokenVerifyError,
  TokenRoleMismatchError,
} from "../errors/JwtErrors";
import { UserRoles } from "../../0-domain/entities/UserRoles";

// type guard for user roles
function isUserRole(role: string): role is UserRoles {
  return ["ADMIN", "EXPERT", "USER"].includes(role);
}

export class JwtService implements IJwtService {
  EMAIL_SECRET: string;
  SECRETS: Record<UserRoles, { refresh: string; access: string }>;
  // REFRESH_TOKEN_SECRET: string;
  // ACCESS_TOKEN_SECRET: string;
  REFRESH_EXPIRY_IN_SECONDS: number = 60 * 60 * 24 * 15; // 15 days
  ACCESS_EXPIRY_IN_SECONDS: number = 60 * 10; // 10 minutes
  constructor({
    emailJwtSecret,
    userAccessTokenSecret,
    userRefreshTokenSecret,
    expertAccessTokenSecret,
    expertRefreshTokenSecret,
    adminRefreshTokenSecret,
    adminAccessTokenSecret,
  }: {
    emailJwtSecret: string;
    userRefreshTokenSecret: string;
    userAccessTokenSecret: string;
    expertRefreshTokenSecret: string;
    expertAccessTokenSecret: string;
    adminRefreshTokenSecret: string;
    adminAccessTokenSecret: string;
  }) {
    this.EMAIL_SECRET = emailJwtSecret;
    this.SECRETS = {
      USER: { access: userAccessTokenSecret, refresh: userRefreshTokenSecret },
      EXPERT: {
        access: expertAccessTokenSecret,
        refresh: expertRefreshTokenSecret,
      },
      ADMIN: {
        access: adminAccessTokenSecret,
        refresh: adminRefreshTokenSecret,
      },
    };
    // this.SECRETS.USER = {}
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

  generateRefreshToken = (payload: tokenBody, role: UserRoles): string => {
    return jwt.sign(payload, this.SECRETS[role].refresh, {
      expiresIn: this.REFRESH_EXPIRY_IN_SECONDS,
      header: {
        alg: "HS256",
        kid: role,
      },
    });
  };

  generateAccessToken = (payload: tokenBody, role: UserRoles): string => {
    return jwt.sign(payload, this.SECRETS[role].access, {
      expiresIn: this.ACCESS_EXPIRY_IN_SECONDS,
      header: {
        alg: "HS256",
        kid: role,
      },
    });
  };

  verifyRefreshToken = (jwtToken: string): JWTPayload => {
    const decoded = jwt.decode(jwtToken, { complete: true }) as any;

    if (!decoded || !decoded.header) {
      throw new InvalidTokenError();
    }

    const header = decoded.header as JwtHeader & { kid?: string };
    const role = header.kid as UserRoles | undefined;

    if (!role || !isUserRole(role)) {
      throw new InvalidTokenRoleError();
    }

    let payload: JWTPayload;
    try {
      payload = <JWTPayload>jwt.verify(jwtToken, this.SECRETS[role].refresh);
    } catch (err) {
      throw new RefreshTokenVerifyError();
    }

    if (!(role === payload.role)) {
      throw new TokenRoleMismatchError();
    }

    return payload;
  };

  verifyAccessToken = (jwtToken: string): JWTPayload => {
    const decoded = jwt.decode(jwtToken, { complete: true }) as any;
    if (!decoded || !decoded.header) {
      throw new InvalidTokenError();
    }

    const header = decoded.header as JwtHeader & { kid?: string };
    const role = header.kid as UserRoles | undefined;

    if (!role || !isUserRole(role)) {
      throw new InvalidTokenRoleError();
    }
    let payload: JWTPayload;
    try {
      payload = <JWTPayload>jwt.verify(jwtToken, this.SECRETS[role].access);
    } catch (err) {
      throw new AccessTokenVerifyError();
    }

    if (!(role === payload.role)) {
      throw new TokenRoleMismatchError();
    }

    return payload;
  };
}
