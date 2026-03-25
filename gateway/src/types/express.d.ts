import { UserRoles } from "./UserRoles";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRoles;
      };
    }
  }
}

export {};
