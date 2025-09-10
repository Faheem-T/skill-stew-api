import { DomainValidationError } from "../errors/DomainValidationError";
import { UserRoles } from "./UserRoles";

export class User {
  id?: string;
  email: string;
  // private _role: Extract<UserRoles, "USER" | "EXPERT">;
  role: "USER";
  name?: string;
  username?: string;
  passwordHash?: string;

  // Profile
  phoneNumber?: string;
  avatarUrl?: string;
  timezone?: string;
  location?: IUserLocation;
  about?: string;
  socialLinks: string[];
  languages: string[];
  isVerified: boolean;

  isSubscribed: boolean;
  // private _yearsOfExperience?: number; // only for experts
  isBlocked: boolean;

  isGoogleLogin: boolean;

  createdAt?: Date;
  updatedAt?: Date;

  constructor({
    email,
    id,
    isGoogleLogin,
  }: {
    email: string;
    id?: string;
    isGoogleLogin: boolean;
  }) {
    if (id) {
      this.id = id;
    }
    this.email = email;
    this.role = "USER";
    this.isVerified = false;
    this.isSubscribed = false;
    this.socialLinks = [];
    this.languages = [];
    this.isBlocked = false;
    this.isGoogleLogin = isGoogleLogin;
  }

  // setExpert() {
  //   this._role = "EXPERT";
  // }

  // setSubscribed() {
  //   if (this._role === "EXPERT") {
  //     throw new DomainValidationError("DOMAIN_USER_ONLY_FIELD");
  //   }
  //   this._isSubscribed = true;
  // }

  // verify() {
  //   if (this._isVerified)
  //     throw new DomainValidationError("USER_ALREADY_VERIFIED");
  //   this._isVerified = true;
  // }

  // setYearsOfExperience(years: number) {
  //   if (this._role === "USER") {
  //     throw new DomainValidationError("DOMAIN_EXPERT_ONLY_FIELD");
  //   }
  //   this._yearsOfExperience = years;
  // }

  // getExperience() {
  //   if (this._role === "USER") return null;
  //   return this._yearsOfExperience as number;
  // }

  // isSubscribed() {
  //   if (this._role === "EXPERT") return null;
  //   return this._isSubscribed as boolean;
  // }

  // isVerified() {
  //   return this._isVerified;
  // }
  //
  // getEmail() {
  //   return this._email;
  // }
  //
  // getRole() {
  //   return this._role;
  // }
}

interface IUserLocation {
  latitude: number;
  longitude: number;
}
