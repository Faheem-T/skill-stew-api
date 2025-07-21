export declare abstract class AppError extends Error {
    readonly message: string;
    readonly code: string;
    readonly context?: Record<string, unknown> | undefined;
    readonly name: string;
    constructor(message: string, code: string, context?: Record<string, unknown> | undefined);
    abstract toJSON(): object;
}
export declare abstract class DomainError extends AppError {
}
export declare abstract class InfrastructureError extends AppError {
}
export declare abstract class ApplicationError extends AppError {
}
