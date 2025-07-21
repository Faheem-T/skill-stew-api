"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtHelper = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JwtErrors_1 = require("../errors/JwtErrors");
function isUserRole(role) {
    return ["ADMIN", "EXPERT", "USER"].includes(role);
}
class JwtHelper {
    constructor({ userAccessTokenSecret, expertAccessTokenSecret, adminAccessTokenSecret, }) {
        this.verifyAccessToken = (jwtToken) => {
            const decoded = jsonwebtoken_1.default.decode(jwtToken, { complete: true });
            if (!decoded || !decoded.header) {
                throw new JwtErrors_1.InvalidTokenError();
            }
            const header = decoded.header;
            const role = header.kid;
            if (!role || !isUserRole(role)) {
                throw new JwtErrors_1.InvalidTokenRoleError();
            }
            let payload;
            try {
                payload = jsonwebtoken_1.default.verify(jwtToken, this._AccessSecrets[role]);
            }
            catch (err) {
                throw new JwtErrors_1.AccessTokenVerifyError();
            }
            if (!(role === payload.role)) {
                throw new JwtErrors_1.TokenRoleMismatchError();
            }
            return payload;
        };
        this._AccessSecrets = {
            USER: userAccessTokenSecret,
            ADMIN: adminAccessTokenSecret,
            EXPERT: expertAccessTokenSecret,
        };
    }
}
exports.JwtHelper = JwtHelper;
