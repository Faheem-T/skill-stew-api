import jwt from "jsonwebtoken";
import type { JwtHeader } from "jsonwebtoken";
import {
  InvalidTokenError,
  InvalidTokenRoleError,
  TokenRoleMismatchError,
} from "../errors/JwtErrors";
import type { UserRoles } from "../types/UserRoles";

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
  SECRETS: Record<UserRoles, { access: string }>;
  REFRESH_EXPIRY_IN_SECONDS: number = 60 * 60 * 24 * 15; // 15 days
  ACCESS_EXPIRY_IN_SECONDS: number = 60 * 10; // 10 minutes
  constructor({
    userAccessTokenSecret,
    expertAccessTokenSecret,
    adminAccessTokenSecret,
  }: {
    userAccessTokenSecret: string;
    expertAccessTokenSecret: string;
    adminAccessTokenSecret: string;
  }) {
    this.SECRETS = {
      USER: { access: userAccessTokenSecret },
      EXPERT: {
        access: expertAccessTokenSecret,
      },
      ADMIN: {
        access: adminAccessTokenSecret,
      },
    };
  }
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
      throw new InvalidTokenError();
    }

    if (!(role === payload.role)) {
      throw new TokenRoleMismatchError();
    }

    return payload;
  };
}
