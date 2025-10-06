import { Skill } from "../../entities/Skill";

export interface ISkillRepository {
  save(skill: Skill): Promise<Skill>;
}
