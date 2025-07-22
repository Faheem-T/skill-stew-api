"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const AppError_1 = require("./AppError");
class UnauthorizedError extends AppError_1.DomainError {
    constructor() {
        super("You are not authorized", "UNAUTHORIZED");
    }
    toJSON() {
        return { error: this.name, message: this.message, code: this.code };
    }
}
exports.UnauthorizedError = UnauthorizedError;
