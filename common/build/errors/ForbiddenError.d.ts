import { ApplicationError } from "./AppError";
export declare class ForbiddenError extends ApplicationError {
    constructor();
    toJSON(): object;
}
