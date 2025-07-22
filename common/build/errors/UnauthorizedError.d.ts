import { DomainError } from "./AppError";
export declare class UnauthorizedError extends DomainError {
    constructor();
    toJSON(): object;
}
