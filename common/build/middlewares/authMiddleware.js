"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const UnauthenticatedError_1 = require("../errors/UnauthenticatedError");
const JwtHelper_1 = require("../jwt-utils/JwtHelper");
class AuthMiddleware {
    constructor(userAccessTokenSecret, expertAccessTokenSecret, adminAccessTokenSecret) {
        this.verify = (req, _res, next) => {
            var _a;
            try {
                const token = (_a = req.headers["authorization"]) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
                if (!token) {
                    throw new UnauthenticatedError_1.UnauthenticatedError();
                }
                const payload = this._jwtHelper.verifyAccessToken(token);
                req.user = Object.assign(Object.assign({ id: payload.userId }, (payload.role === "ADMIN"
                    ? { userame: payload.username }
                    : { email: payload.email })), { role: payload.role });
                next();
            }
            catch (err) {
                next(err);
            }
        };
        this._jwtHelper = new JwtHelper_1.JwtHelper({
            userAccessTokenSecret,
            expertAccessTokenSecret,
            adminAccessTokenSecret,
        });
    }
}
exports.AuthMiddleware = AuthMiddleware;
