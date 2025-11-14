import { UserFilters } from "../../domain/repositories/IUserRepository";

export interface GetAllUsersInputDTO {
  limit: number;
  cursor?: string;
  filters?: UserFilters;
}

export interface PresentationUser {
  id: string;
  role: string;
  name: string | undefined;
  username: string | undefined;
  email: string;
  phone_number: string | undefined;
  avatar_key: string | undefined;
  banner_key: string | undefined;
  timezone: string | undefined;
  about: string | undefined;
  social_links: string[];
  languages: string[];
  is_subscribed: boolean;
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
