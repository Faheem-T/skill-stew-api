import { InfrastructureError } from "./AppError";
import { JwtErrorCodes } from "./codes/JwtErrorCodes";
export declare class JwtError extends InfrastructureError {
    constructor(code: keyof typeof JwtErrorCodes);
    toJSON(): object;
}
export declare class EmailVerificationJwtVerifyError extends JwtError {
    constructor();
}
export declare class RefreshTokenVerifyError extends JwtError {
    constructor();
}
export declare class AccessTokenVerifyError extends JwtError {
    constructor();
}
export declare class InvalidTokenError extends JwtError {
    constructor();
}
export declare class InvalidTokenRoleError extends JwtError {
    constructor();
}
export declare class TokenRoleMismatchError extends JwtError {
    constructor();
}
