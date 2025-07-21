import { NextFunction, Request, Response } from "express";
import { UserRoles } from "../types/UserRoles";
export declare const requireRole: (...roles: UserRoles[]) => (req: Request, _res: Response, next: NextFunction) => void;
