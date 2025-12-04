import { UserRoles } from "./UserRoles";

export class User {
  constructor(
    public id: string,
    public email: string,
    public role: UserRoles,
    public isVerified: boolean,
    public isBlocked: boolean,
    public isGoogleLogin: boolean,
    public username?: string,
    public passwordHash?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
