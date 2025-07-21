"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = void 0;
const AppError_1 = require("./AppError");
class ForbiddenError extends AppError_1.ApplicationError {
    constructor() {
        super("Forbidden", "FORBIDDEN_ERROR");
    }
    toJSON() {
        return { message: this.message, code: this.code };
    }
}
exports.ForbiddenError = ForbiddenError;
