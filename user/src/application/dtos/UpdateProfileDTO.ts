export interface UpdateProfileDTO {
  id: string;
  name?: string;
  username?: string;
  phoneNumber?: string;
  avatarKey?: string;
  timezone?: string;
  location?: IUserLocation;
  about?: string;
  socialLinks?: string[];
  languages?: string[];
}

interface IUserLocation {
  latitude: number;
  longitude: number;
}
