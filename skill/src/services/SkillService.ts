import { CreateSkillDTO, SkillResponseDTO } from "../dtos/skill.dto";
import { Skill } from "../entities/Skill";
import { ISkillRepository } from "../interfaces/repository-interfaces/ISkillRepository";
import { ISkillService } from "../interfaces/service-interfaces/ISkillService";

export class SkillService implements ISkillService {
  constructor(private _skillRepo: ISkillRepository) {}

  createSkill = async ({
    name,
    alternateNames,
    description,
    status,
    category,
  }: CreateSkillDTO): Promise<SkillResponseDTO> => {
    const skill = new Skill({
      name,
      alternateNames,
      description,
      status,
      category,
    });
    const savedSkill = await this._skillRepo.save(skill);
    return {
      id: savedSkill.id,
      name: savedSkill.name,
      normalizedName: savedSkill.normalizedName,
      description: savedSkill.description,
      category: savedSkill.category,
      alternateNames: savedSkill.alternateNames,
      status: savedSkill.status,
    };
  };

  getSkillById = async (id: string): Promise<SkillResponseDTO | null> => {
    const skill = await this._skillRepo.getById(id);
    if (!skill) return null;

    return {
      id: skill.id,
      name: skill.name,
      normalizedName: skill.normalizedName,
      description: skill.description,
      category: skill.category,
      alternateNames: skill.alternateNames,
      status: skill.status,
    };
  };
}
