"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const ForbiddenError_1 = require("../errors/ForbiddenError");
const requireRole = (...roles) => {
    return (req, _res, next) => {
        try {
            if (!req.user || !roles.includes(req.user.role)) {
                throw new ForbiddenError_1.ForbiddenError();
            }
            else {
                next();
            }
        }
        catch (err) {
            next(err);
        }
    };
};
exports.requireRole = requireRole;
