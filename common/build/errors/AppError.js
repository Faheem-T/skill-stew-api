"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationError = exports.InfrastructureError = exports.DomainError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, code, context) {
        super(message);
        this.message = message;
        this.code = code;
        this.context = context;
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.AppError = AppError;
class DomainError extends AppError {
}
exports.DomainError = DomainError;
class InfrastructureError extends AppError {
}
exports.InfrastructureError = InfrastructureError;
class ApplicationError extends AppError {
}
exports.ApplicationError = ApplicationError;
