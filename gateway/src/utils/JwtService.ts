import jwt, { JwtHeader } from "jsonwebtoken";
import {
  AccessTokenVerifyError,
  InvalidTokenError,
  InvalidTokenRoleError,
  RefreshTokenVerifyError,
  TokenRoleMismatchError,
} from "../errors/JwtErrors";
import { UserRoles } from "../types/UserRoles";

type tokenBody = {
  userId: string;
  email: string;
  role: UserRoles;
};

type JWTPayload = tokenBody & {
  iat: number;
  exp: number;
};

// type guard for user roles
function isUserRole(role: string): role is UserRoles {
  return ["ADMIN", "EXPERT", "USER"].includes(role);
}

export class JwtService {
  SECRETS: Record<UserRoles, { refresh: string; access: string }>;
  REFRESH_EXPIRY_IN_SECONDS: number = 60 * 60 * 24 * 15; // 15 days
  ACCESS_EXPIRY_IN_SECONDS: number = 60 * 10; // 10 minutes
  constructor({
    userAccessTokenSecret,
    userRefreshTokenSecret,
    expertAccessTokenSecret,
    expertRefreshTokenSecret,
    adminRefreshTokenSecret,
    adminAccessTokenSecret,
  }: {
    userRefreshTokenSecret: string;
    userAccessTokenSecret: string;
    expertRefreshTokenSecret: string;
    expertAccessTokenSecret: string;
    adminRefreshTokenSecret: string;
    adminAccessTokenSecret: string;
  }) {
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
