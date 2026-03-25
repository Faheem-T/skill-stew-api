import jwt, { JwtHeader } from "jsonwebtoken";
import {
  AccessTokenVerifyError,
  InvalidTokenError,
  InvalidTokenRoleError,
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
  return ["ADMIN", "EXPERT", "EXPERT_APPLICANT", "USER"].includes(role);
}

export class JwtService {
  SECRETS: Record<UserRoles, string>;
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
      USER: userAccessTokenSecret,
      EXPERT: expertAccessTokenSecret,
      ADMIN: adminAccessTokenSecret,
      EXPERT_APPLICANT: expertAccessTokenSecret,
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
      payload = <JWTPayload>jwt.verify(jwtToken, this.SECRETS[role]);
    } catch (err) {
      throw new AccessTokenVerifyError();
    }

    if (!(role === payload.role)) {
      throw new TokenRoleMismatchError();
    }

    return payload;
  };
}
