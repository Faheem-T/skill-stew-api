import { RequestHandler } from "express";
export declare class AuthMiddleware {
    private _jwtHelper;
    constructor(userAccessTokenSecret: string, expertAccessTokenSecret: string, adminAccessTokenSecret: string);
    verify: RequestHandler;
}
