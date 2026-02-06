export type GetRecommendedUsersOutputDTO = {
  id: string;
  name?: string;
  username?: string;
  location?: string;
  languages?: string[];
  offeredSkills?: { skillId: string; skillName: string }[];
  wantedSkills?: { skillId: string; skillName: string }[];
  avatarUrl?: string;
}[];
