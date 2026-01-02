import type { CreateSkillDTO, SkillResponseDTO } from "../../dtos/skill.dto";

export interface ISkillService {
  createSkill(data: CreateSkillDTO): Promise<SkillResponseDTO>;
  getSkillById(id: string): Promise<SkillResponseDTO | null>;
}
