import { RequestUser } from "../../3-presentation/types/RequestType";
import { UserRoles } from "../../0-domain/entities/UserRoles";

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
