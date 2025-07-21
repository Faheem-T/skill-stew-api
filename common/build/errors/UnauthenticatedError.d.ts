import { ApplicationError } from "./AppError";
export declare class UnauthenticatedError extends ApplicationError {
    constructor();
    toJSON(): object;
}
