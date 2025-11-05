export class User {
  id: string;

  name?: string;
  username?: string;
  location?: IUserLocation;
  languages?: string[];
  isVerified?: boolean;

  constructor(id: string) {
    this.id = id;
  }
}

interface IUserLocation {
  latitude: number;
  longitude: number;
}
