export interface User {
  id?: string;
  email: string;
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
  isBlocked: boolean;

  // isGoogleLogin: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
interface IUserLocation {
  latitude: number;
  longitude: number;
}
