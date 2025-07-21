import { UserRoles } from "../types/UserRoles";
export type tokenBody = {
    userId: string;
    email: string;
    role: Exclude<UserRoles, "ADMIN">;
} | {
    userId: string;
    username: string;
    role: "ADMIN";
};
export type JWTPayload = tokenBody & {
    iat: number;
    exp: number;
};
export declare class JwtHelper {
    private _AccessSecrets;
    constructor({ userAccessTokenSecret, expertAccessTokenSecret, adminAccessTokenSecret, }: {
        userAccessTokenSecret: string;
        expertAccessTokenSecret: string;
        adminAccessTokenSecret: string;
    });
    verifyAccessToken: (jwtToken: string) => JWTPayload;
}
