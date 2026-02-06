import { Skill } from "../../domain/entities/Skill";
import { ISkillRepository } from "../../domain/repositories/ISkillRepository";
import {
  CreateSkillDTO,
  SkillOutputDTO,
  UpdateSkillDTO,
} from "../dtos/SkillDTO";
import { ISkillService } from "../interfaces/ISkillService";

export class SkillService implements ISkillService {
  constructor(private _repo: ISkillRepository) {}
  create = async (dto: CreateSkillDTO): Promise<void> => {
    const skill = new Skill(dto.id, dto.name, dto.alternateNames);
    await this._repo.create(skill.id, skill);
  };

  update = async (dto: UpdateSkillDTO): Promise<void> => {
    const partialSkill: Partial<Skill> = {
      id: dto.id,
      name: dto.name,
      alternateNames: dto.alternateNames,
    };
    await this._repo.update(dto.id, partialSkill);
  };

  delete = async (id: string): Promise<void> => {
    await this._repo.delete(id);
  };

  search = async (query: string): Promise<SkillOutputDTO> => {
    return this._repo.search(query);
  };
}
