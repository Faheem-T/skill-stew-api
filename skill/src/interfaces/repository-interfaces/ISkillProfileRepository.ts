import { SkillProfile } from "../../entities/SkillProfile";

export interface ISkillProfileRepository {
  save(profile: SkillProfile): Promise<SkillProfile>;
  getById(id: string): Promise<SkillProfile | null>;
}
