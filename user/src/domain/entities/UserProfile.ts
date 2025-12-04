export class UserProfile {
  constructor(
    public id: string,
    public userId: string,
    public isSubscribed: boolean,
    public name?: string,
    public phoneNumber?: string,
    public avatarKey?: string,
    public bannerKey?: string,
    public timezone?: string,
    public about?: string,
    public socialLinks?: string[],
    public languages?: string[],
    public location?: IUserLocation,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}

export interface IUserLocation {
  placeId: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
}
