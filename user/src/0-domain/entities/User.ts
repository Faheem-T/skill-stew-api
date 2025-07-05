import { DomainValidationError } from "../errors/DomainValidationError";

export type UserRoles = "USER" | "EXPERT";
export class User {
  id?: number;
  private _email: string;
  private _role: UserRoles;
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
  private _isVerified: boolean;

  private _isSubscribed?: boolean; // only for users
  private _yearsOfExperience?: number; // only for experts

  constructor(email: string, id?: number) {
    if (id) {
      this.id = id;
    }
    this._email = email;
    this._role = "USER";
    this._isVerified = false;
    this._isSubscribed = false;
    this.socialLinks = [];
    this.languages = [];
  }

  setExpert() {
    this._role = "EXPERT";
  }

  setSubscribed() {
    if (this._role === "EXPERT") {
      throw new DomainValidationError("DOMAIN_USER_ONLY_FIELD");
    }
    this._isSubscribed = true;
  }

  verify() {
    this._isVerified = true;
  }

  setYearsOfExperience(years: number) {
    if (this._role === "USER") {
      throw new DomainValidationError("DOMAIN_EXPERT_ONLY_FIELD");
    }
    this._yearsOfExperience = years;
  }

  getExperience() {
    if (this._role === "USER") return null;
    return this._yearsOfExperience as number;
  }

  isSubscribed() {
    if (this._role === "EXPERT") return null;
    return this._isSubscribed as boolean;
  }

  isVerified() {
    return this._isVerified;
  }

  getEmail() {
    return this._email;
  }

  getRole() {
    return this._role;
  }
}

interface IUserLocation {
  latitude: number;
  longitude: number;
}
