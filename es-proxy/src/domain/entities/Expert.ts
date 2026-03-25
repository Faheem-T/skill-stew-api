export class Expert {
  id: string;
  username: string;
  fullName: string;
  bio: string;
  yearsExperience: number;

  constructor(id: string) {
    this.id = id;
    this.username = "";
    this.fullName = "";
    this.bio = "";
    this.yearsExperience = 0;
  }
}
