"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRoleMismatchError = exports.InvalidTokenRoleError = exports.InvalidTokenError = exports.AccessTokenVerifyError = exports.RefreshTokenVerifyError = exports.EmailVerificationJwtVerifyError = exports.JwtError = void 0;
const AppError_1 = require("./AppError");
const JwtErrorCodes_1 = require("./codes/JwtErrorCodes");
class JwtError extends AppError_1.InfrastructureError {
    constructor(code) {
        super(JwtErrorCodes_1.JwtErrorCodes[code], code);
    }
    toJSON() {
        return { error: this.name, message: this.message, code: this.code };
    }
}
exports.JwtError = JwtError;
class EmailVerificationJwtVerifyError extends JwtError {
    constructor() {
        super("EMAIL_VERIFICATION_JWT_VERIFY_ERROR");
    }
}
exports.EmailVerificationJwtVerifyError = EmailVerificationJwtVerifyError;
class RefreshTokenVerifyError extends JwtError {
    constructor() {
        super("REFRESH_TOKEN_VERIFY_ERROR");
    }
}
exports.RefreshTokenVerifyError = RefreshTokenVerifyError;
class AccessTokenVerifyError extends JwtError {
    constructor() {
        super("ACCESS_TOKEN_VERIFY_ERROR");
    }
}
exports.AccessTokenVerifyError = AccessTokenVerifyError;
class InvalidTokenError extends JwtError {
    constructor() {
        super("INVALID_TOKEN_ERROR");
    }
}
exports.InvalidTokenError = InvalidTokenError;
class InvalidTokenRoleError extends JwtError {
    constructor() {
        super("INVALID_TOKEN_ROLE_ERROR");
    }
}
exports.InvalidTokenRoleError = InvalidTokenRoleError;
class TokenRoleMismatchError extends JwtError {
    constructor() {
        super("TOKEN_ROLE_MISMATCH_ERROR");
    }
}
exports.TokenRoleMismatchError = TokenRoleMismatchError;
