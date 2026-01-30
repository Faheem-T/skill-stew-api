import { skillProficiencies, SkillProfile } from "../entities/SkillProfile";

export type HydratedSkillProfile = {
  offered: {
    skill: { id: string; name: string };
    proficiency: typeof skillProficiencies;
    hoursTaught: number;
  }[];
  wanted: {
    skill: { id: string; name: string };
    hoursLearned: number;
  }[];
};

export interface ISkillProfileRepository {
  save(profile: SkillProfile): Promise<Required<SkillProfile>>;
  getById(id: string): Promise<SkillProfile>;
  getHydratedByUserId(id: string): Promise<HydratedSkillProfile>;
}
