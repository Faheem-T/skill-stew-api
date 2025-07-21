"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthenticatedError = void 0;
const AppError_1 = require("./AppError");
class UnauthenticatedError extends AppError_1.ApplicationError {
    constructor() {
        super("Unauthenticated", "USER_UNAUTHENTICATED");
    }
    toJSON() {
        return { name: this.name, message: this.message };
    }
}
exports.UnauthenticatedError = UnauthenticatedError;
