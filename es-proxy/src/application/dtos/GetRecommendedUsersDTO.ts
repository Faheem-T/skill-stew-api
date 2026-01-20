export type GetRecommendedUsersOutputDTO = {
  id: string;
  name?: string;
  username?: string;
  location?: string;
  languages?: string[];
  offeredSkills?: string[];
  wantedSkills?: string[];
  avatarUrl?: string;
}[];
