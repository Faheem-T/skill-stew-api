import { UserFilters } from "../../0-domain/repositories/IUserRepository";

export interface GetAllUsersDTO {
  limit: number;
  cursor?: string;
  filters?: UserFilters;
}
