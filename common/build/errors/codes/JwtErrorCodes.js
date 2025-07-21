"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtErrorCodes = void 0;
var JwtErrorCodes;
(function (JwtErrorCodes) {
    JwtErrorCodes["EMAIL_VERIFICATION_JWT_VERIFY_ERROR"] = "Invalid email verification jwt";
    JwtErrorCodes["REFRESH_TOKEN_VERIFY_ERROR"] = "Invalid refresh token";
    JwtErrorCodes["ACCESS_TOKEN_VERIFY_ERROR"] = "Invalid access token";
    JwtErrorCodes["INVALID_TOKEN_ERROR"] = "Invalid token";
    JwtErrorCodes["INVALID_TOKEN_ROLE_ERROR"] = "Invalid role identifier";
    JwtErrorCodes["TOKEN_ROLE_MISMATCH_ERROR"] = "Role mismatch between payload and header";
})(JwtErrorCodes || (exports.JwtErrorCodes = JwtErrorCodes = {}));
