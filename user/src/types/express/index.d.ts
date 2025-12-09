import { RequestUser } from "../../presentation/types/RequestType";
import { UserRoles } from "../../domain/entities/UserRoles";

export interface RequestUser {
  id: string | number;
  email: string;
  role: UserRoles;
}

declare global {
  namespace Express {
    interface Request {
      user: RequestUser;
    }
  }
}
