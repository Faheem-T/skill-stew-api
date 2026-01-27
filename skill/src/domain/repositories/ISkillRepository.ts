import { Skill } from "../entities/Skill";

export interface ISkillRepository {
  save(skill: Skill): Promise<Skill>;
  getById(id: string): Promise<Skill>;
}
