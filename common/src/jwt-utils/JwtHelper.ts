import jwt, { JwtHeader } from "jsonwebtoken";
import { UserRoles } from "../types/UserRoles";
import {
  AccessTokenVerifyError,
  InvalidTokenError,
  InvalidTokenRoleError,
  TokenRoleMismatchError,
} from "../errors/JwtErrors";

function isUserRole(role: string): role is UserRoles {
  return ["ADMIN", "EXPERT", "USER"].includes(role);
}

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

export class JwtHelper {
  private _AccessSecrets: Record<UserRoles, string>;
  constructor({
    userAccessTokenSecret,
    expertAccessTokenSecret,
    adminAccessTokenSecret,
  }: {
    userAccessTokenSecret: string;
    expertAccessTokenSecret: string;
    adminAccessTokenSecret: string;
  }) {
    this._AccessSecrets = {
      USER: userAccessTokenSecret,
      ADMIN: adminAccessTokenSecret,
      EXPERT: expertAccessTokenSecret,
    };
  }

  verifyAccessToken = (jwtToken: string) => {
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
      payload = <JWTPayload>jwt.verify(jwtToken, this._AccessSecrets[role]);
    } catch (err) {
      throw new AccessTokenVerifyError();
    }

    if (!(role === payload.role)) {
      throw new TokenRoleMismatchError();
    }

    return payload;
  };
}
