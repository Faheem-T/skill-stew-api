export class User {
  id: string;

  name?: string;
  username?: string;
  location?: IUserLocation;
  languages?: string[];
  isVerified?: boolean;

  offeredSkills?: { skillId: string; skillName: string }[];
  wantedSkills?: { skillId: string; skillName: string }[];

  constructor(id: string) {
    this.id = id;
  }
}

interface IUserLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}
