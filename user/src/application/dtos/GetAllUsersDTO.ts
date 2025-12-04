import { UserFilters } from "../../domain/repositories/IUserRepository";

export interface GetAllUsersInputDTO {
  limit: number;
  cursor?: string;
  filters?: UserFilters;
}

export interface PresentationUser {
  id: string;
  role: string;
  username: string | undefined;
  email: string;
  is_verified: boolean;
  is_blocked: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface GetAllUsersOutputDTO {
  users: PresentationUser[];
  hasNextPage: boolean;
  nextCursor: string | undefined;
}
